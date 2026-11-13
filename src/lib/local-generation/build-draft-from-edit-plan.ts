import type { EditPlan } from "@/lib/cloud-ai/edit-plan-types";
import { groupWordsIntoCaptions, pickHighlightWord } from "@/lib/local-generation/build-draft-from-transcript";
import type { TranscriptWord } from "@/lib/local-transcription/transcript-word-types";
import type { ReelStyleSettings } from "@/lib/reel-options/reel-style-options";
import type { CaptionCue, ReelDraft } from "@/lib/reel-project-types";

// Builds the reel draft from Claude's edit plan: its chosen moment, hooks, keywords and post caption.
// Captions still come from the real transcript; Claude only decides what to keep and what to highlight.

const MIN_SEGMENT_SECONDS = 3;
const LENGTH_TOLERANCE_SECONDS = 1.5; // Claude may land slightly past the target on a sentence end

export function buildDraftFromEditPlan(
  words: TranscriptWord[],
  plan: EditPlan,
  style: ReelStyleSettings,
  sourceDurationSeconds: number,
): ReelDraft | null {
  const segment = checkedSegment(words, plan, style.lengthSeconds, sourceDurationSeconds);
  if (!segment) return null; // unusable plan → caller falls back to the simple rules

  const durationSeconds = round(segment.end - segment.start);
  const wordsInReel = shiftWords(words, segment.start, segment.end);
  const captions = groupWordsIntoCaptions(wordsInReel, durationSeconds).map((cue) =>
    withPlanHighlight(cue, plan.highlightKeywords),
  );

  return {
    durationSeconds,
    sourceStartSeconds: round(segment.start),
    hookOptions: cleanHooks(plan.hooks),
    selectedHookIndex: 0,
    customHook: "",
    coldOpen: false,
    captions,
    brollClips: [], // stock footage search (plan.brollKeywords) comes later
    musicTrackId: null,
    effects: { zoomPunchIns: true, transitions: true, soundEffects: true },
    postCaption: plan.postCaption.trim(),
    hashtags: cleanHashtags(plan.hashtags),
  };
}

/** Keeps Claude's segment inside the video and the target length, snapped to real word times. */
function checkedSegment(words: TranscriptWord[], plan: EditPlan, targetSeconds: number, sourceSeconds: number) {
  const videoEnd = sourceSeconds > 0 ? sourceSeconds : Infinity;
  const firstWord = words.find((word) => word.startSeconds >= plan.segmentStartSeconds - 0.3);
  if (!firstWord) return null;

  const start = Math.max(0, firstWord.startSeconds - 0.1);
  const latestEnd = Math.min(videoEnd, start + targetSeconds + LENGTH_TOLERANCE_SECONDS);
  const end = Math.min(latestEnd, plan.segmentEndSeconds + 0.3);
  return end - start >= MIN_SEGMENT_SECONDS ? { start, end } : null;
}

/** Words inside the segment, with times moved so the reel starts at 0. */
function shiftWords(words: TranscriptWord[], start: number, end: number): TranscriptWord[] {
  return words
    .filter((word) => word.startSeconds >= start && word.startSeconds < end)
    .map((word) => ({
      text: word.text,
      startSeconds: word.startSeconds - start,
      endSeconds: Math.min(word.endSeconds, end) - start,
    }));
}

/** Uses Claude's keyword if the caption line contains one, otherwise the simple rule. */
function withPlanHighlight(cue: CaptionCue, keywords: string[]): CaptionCue {
  const lineWords = cue.text.split(" ").map((word) => word.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase());
  const match = keywords.find((keyword) => lineWords.includes(keyword.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase()));
  return { ...cue, highlightWord: match ? match.toUpperCase() : pickHighlightWord(cue.text) };
}

function cleanHooks(hooks: string[]): string[] {
  const cleaned = hooks.map((hook) => hook.replace(/^["'“”]+|["'“”]+$/g, "").trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.slice(0, 3) : ["Simak sampai habis!"];
}

function cleanHashtags(hashtags: string[]): string[] {
  return hashtags
    .map((tag) => `#${tag.replace(/^#+/, "").replace(/\s+/g, "").toLowerCase()}`)
    .filter((tag) => tag.length > 1)
    .slice(0, 6);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
