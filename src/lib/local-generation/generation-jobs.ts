import "server-only";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildDemoDraft } from "@/lib/demo-store/demo-draft-builder";
import {
  GENERATION_RESULTS_DIR,
  RENDER_WORK_DIR,
  SOURCE_VIDEOS_DIR,
  ensureDataFolders,
} from "@/lib/local-files/local-data-paths";
import { readAiServiceSettings } from "@/lib/local-ai/ai-service-settings";
import { requestEditPlan } from "@/lib/local-ai/request-edit-plan";
import { buildDraftFromEditPlan } from "@/lib/local-generation/build-draft-from-edit-plan";
import { buildDraftFromTranscript } from "@/lib/local-generation/build-draft-from-transcript";
import { toTimedSentences } from "@/lib/local-generation/timed-sentences";
import type { Transcript, TranscriptWord } from "@/lib/local-transcription/transcript-word-types";
import { findWhisperTools } from "@/lib/local-transcription/find-whisper-tools";
import { transcribeVideoSpeech } from "@/lib/local-transcription/transcribe-video-speech";
import { GENERATION_PIPELINE_STEPS } from "@/lib/reel-options/generation-pipeline-steps";
import type { ReelStyleSettings } from "@/lib/reel-options/reel-style-options";
import type { ReelDraft } from "@/lib/reel-project-types";

// Runs "Generate reel" on this PC in the background and keeps track of its progress.
// Finished results are also written to disk, so they survive an app restart.

export type GenerationJob = {
  status: "running" | "done" | "failed";
  completedSteps: number; // steps of GENERATION_PIPELINE_STEPS that are finished
  currentStepShare: number; // rough progress (0–1) of the current step
  draft: ReelDraft | null;
  usedSampleContent: boolean; // true when Whisper isn't installed and sample captions were used
  aiNote: string | null; // why the AI edit plan wasn't used, if it wasn't
  speechNote: string | null; // warning when the video has no or very little speech
  errorMessage: string | null;
};

export type StartGenerationInput = {
  projectId: string;
  sourceVideoId: string;
  sourceDurationSeconds: number;
  style: ReelStyleSettings;
};

type RunningJob = GenerationJob & { transcribeStartedAt: number; expectedTranscribeMs: number };

// Kept on globalThis so every API route sees the same jobs, even if Next.js loads this file twice.
const jobs: Map<string, RunningJob> = ((globalThis as { racikGenerationJobs?: Map<string, RunningJob> }).racikGenerationJobs ??=
  new Map());

/** Starts a generation and returns immediately; poll `readGenerationJob` for progress. */
export function startGenerationJob(input: StartGenerationInput) {
  const job: RunningJob = {
    status: "running",
    completedSteps: 0,
    currentStepShare: 0,
    draft: null,
    usedSampleContent: false,
    aiNote: null,
    speechNote: null,
    errorMessage: null,
    transcribeStartedAt: Date.now(),
    // Whisper "small" on an average laptop: roughly as long as the video itself.
    expectedTranscribeMs: Math.max(10_000, input.sourceDurationSeconds * 1000),
  };
  jobs.set(input.projectId, job);
  runGeneration(input, job).catch((error) => finishJob(input.projectId, job, { failed: error }));
}

/** Current state of a generation, from memory or from the saved result file. */
export async function readGenerationJob(projectId: string): Promise<GenerationJob | null> {
  const job = jobs.get(projectId);
  if (job) return { ...publicJobState(job), currentStepShare: estimateStepShare(job) };
  try {
    return JSON.parse(await readFile(resultFilePath(projectId), "utf8")) as GenerationJob;
  } catch {
    return null; // unknown, or the app closed while it was running
  }
}

// ---------- The pipeline ----------

async function runGeneration(input: StartGenerationInput, job: RunningJob) {
  await ensureDataFolders();
  const workDir = path.join(RENDER_WORK_DIR, `generate-${input.projectId}`);
  await mkdir(workDir, { recursive: true });

  try {
    const draft = await buildDraft(input, job, workDir);
    job.completedSteps = GENERATION_PIPELINE_STEPS.length; // the other steps are instant for now
    job.draft = draft;
    await finishJob(input.projectId, job, {});
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

/** Step 1: speech to text on this PC. Steps 2–4: the AI edit plan (online), or simple rules as a fallback. */
async function buildDraft(input: StartGenerationInput, job: RunningJob, workDir: string): Promise<ReelDraft> {
  const tools = findWhisperTools();
  if (!tools) {
    job.usedSampleContent = true;
    return buildDemoDraft(input.style, input.sourceDurationSeconds);
  }
  const videoPath = path.join(SOURCE_VIDEOS_DIR, input.sourceVideoId);
  const transcript = await transcribeVideoSpeech(tools, videoPath, input.style.language, workDir);
  job.completedSteps = 1;
  job.speechNote = littleSpeechNote(transcript, input.sourceDurationSeconds);
  await saveTranscriptCopy(input.projectId, transcript);

  const aiDraft = await tryAiDraft(transcript.words, input, job);
  return aiDraft ?? buildDraftFromTranscript(transcript.words, input.style, input.sourceDurationSeconds);
}

/** Asks the online AI for the edit plan. Returns null (and notes why) when AI isn't available. */
async function tryAiDraft(words: TranscriptWord[], input: StartGenerationInput, job: RunningJob): Promise<ReelDraft | null> {
  const settings = await readAiServiceSettings();
  if (!settings) {
    job.aiNote = "AI hooks are off. Add the AI service access code on the Account page.";
    return null;
  }
  const sentences = toTimedSentences(words);
  if (sentences.length === 0) return null; // no speech: nothing for Claude to plan

  try {
    const plan = await requestEditPlan(settings, {
      sentences,
      targetSeconds: input.style.lengthSeconds,
      hookStyle: input.style.hookStyle,
      language: input.style.language,
    });
    const draft = buildDraftFromEditPlan(words, plan, input.style, input.sourceDurationSeconds);
    if (!draft) job.aiNote = "The AI's plan didn't fit this video, so simple hooks were used.";
    return draft;
  } catch (error) {
    console.error("AI edit plan failed", error);
    job.aiNote = "The AI service couldn't be reached, so simple hooks were used.";
    return null;
  }
}

async function finishJob(projectId: string, job: RunningJob, outcome: { failed?: unknown }) {
  if (outcome.failed) {
    console.error("Generation failed", outcome.failed);
    job.status = "failed";
    job.errorMessage = "We couldn't make this reel. Please try again with another video.";
  } else {
    job.status = "done";
  }
  await writeFile(resultFilePath(projectId), JSON.stringify(publicJobState(job)), "utf8").catch(() => {});
  jobs.delete(projectId);
}

// ---------- Helpers ----------

/** A warning when Whisper found no or very little speech (e.g. silent video, speech on a muted track). */
function littleSpeechNote(transcript: Transcript, videoSeconds: number): string | null {
  if (transcript.audioTrackCount === 0) return "This video has no sound, so there are no captions.";
  const expectedMinimumWords = Math.max(5, videoSeconds / 12); // normal talk is ~2 words a second
  if (transcript.words.length < expectedMinimumWords) {
    return "We heard very little speech in this video. Check that it has clear spoken sound.";
  }
  return null;
}

/** Keeps what Whisper heard next to the result, so a bad transcription can be checked later. */
async function saveTranscriptCopy(projectId: string, transcript: Transcript) {
  const filePath = path.join(GENERATION_RESULTS_DIR, `${projectId}.transcript.json`);
  await writeFile(filePath, JSON.stringify(transcript, null, 1), "utf8").catch(() => {});
}

function publicJobState(job: RunningJob): GenerationJob {
  const { status, completedSteps, currentStepShare, draft, usedSampleContent, aiNote, speechNote, errorMessage } = job;
  return { status, completedSteps, currentStepShare, draft, usedSampleContent, aiNote, speechNote, errorMessage };
}

/** Guessed progress through transcription, so the progress ring keeps moving (never reaches 100%). */
function estimateStepShare(job: RunningJob): number {
  if (job.completedSteps > 0) return 0;
  return Math.min(0.95, (Date.now() - job.transcribeStartedAt) / job.expectedTranscribeMs);
}

function resultFilePath(projectId: string): string {
  return path.join(GENERATION_RESULTS_DIR, `${projectId}.json`);
}
