"use client";

// Demo-mode data store. Keeps the project list and credits in the app's local storage.
// Videos themselves are saved on the PC's disk (see src/app/api/local).
// Sign-in, credits and AI move to the online service later (see supabase/migrations).

import { useEffect, useSyncExternalStore } from "react";
import { type GenerationStatus, fetchGenerationStatus } from "@/lib/local-generation/generation-client";
import { overallProgressPercent } from "@/lib/reel-options/generation-pipeline-steps";
import {
  creditCostForLength,
  type CaptionStyleId,
  type ReelStyleSettings,
} from "@/lib/reel-options/reel-style-options";
import type { ReelDraft, ReelProject } from "@/lib/reel-project-types";

const STORAGE_KEY = "racik-reels-demo-v1";
const STARTING_DEMO_CREDITS = 12;
const FREE_REGENERATIONS_PER_REEL = 2;
const PROGRESS_CHECK_MS = 1500;

type DemoState = { credits: number; projects: ReelProject[] };

const EMPTY_STATE: DemoState = { credits: STARTING_DEMO_CREDITS, projects: [] };

// ---------- Reading and writing ----------

let cachedState: DemoState | null = null;
const listeners = new Set<() => void>();

function loadStateFromStorage(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoState) : EMPTY_STATE;
  } catch {
    return EMPTY_STATE; // private window or blocked storage
  }
}

function getState(): DemoState {
  if (!cachedState) cachedState = loadStateFromStorage();
  return cachedState;
}

function setState(next: DemoState) {
  cachedState = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: keep working in memory for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function updateProject(projectId: string, change: (project: ReelProject) => ReelProject) {
  const state = getState();
  setState({
    ...state,
    projects: state.projects.map((project) => (project.id === projectId ? change(project) : project)),
  });
}

// ---------- React hooks ----------

/** Whole demo state; re-renders when anything changes. */
export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, getState, () => EMPTY_STATE);
}

/** True once the browser store has been read (avoids flashing "not found" on first render). */
export function useIsStoreReady(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function useDemoProject(projectId: string): ReelProject | undefined {
  return useDemoState().projects.find((project) => project.id === projectId);
}

/** While a page that shows reels is open, asks the PC how each reel in progress is doing. */
export function useGenerationTicker() {
  useEffect(() => {
    checkGenerationsInProgress();
    const timer = window.setInterval(checkGenerationsInProgress, PROGRESS_CHECK_MS);
    return () => window.clearInterval(timer);
  }, []);
}

// ---------- Video chosen on the Create screen, waiting for "Generate" ----------

export type PendingUpload = { fileName: string; durationSeconds: number; sourceVideoId: string };

let pendingUpload: PendingUpload | null = null;

export function setPendingUpload(upload: PendingUpload) {
  pendingUpload = upload;
}

export function getPendingUpload(): PendingUpload | null {
  return pendingUpload;
}

/** Address of the original video saved on this PC, for the preview player. */
export function sourceVideoUrl(project: ReelProject): string | null {
  return project.sourceVideoId ? `/api/local/source-videos/${project.sourceVideoId}` : null;
}

// ---------- Actions ----------

type StartResult = { ok: true; project: ReelProject } | { ok: false; error: string };

/** Hard credit check, then charge credits and add the reel as "Processing". The caller starts the PC job. */
export function startGeneration(upload: PendingUpload, style: ReelStyleSettings): StartResult {
  const state = getState();
  const cost = creditCostForLength(style.lengthSeconds);
  if (state.credits < cost) {
    return { ok: false, error: `You need ${cost} credit${cost > 1 ? "s" : ""} but have ${state.credits}.` };
  }

  const projectId = crypto.randomUUID();
  const project: ReelProject = {
    id: projectId,
    title: titleFromFileName(upload.fileName),
    sourceFileName: upload.fileName,
    sourceDurationSeconds: upload.durationSeconds,
    sourceVideoId: upload.sourceVideoId,
    renderedReelId: null,
    createdAt: Date.now(),
    status: "processing",
    style,
    creditsCharged: cost,
    generationStartedAt: Date.now(),
    regenerationsUsed: 0,
    draft: null,
  };

  pendingUpload = null;
  setState({ credits: state.credits - cost, projects: [project, ...state.projects] });
  return { ok: true, project };
}

/** Overall progress of a reel being made, 0–100. */
export function generationProgressPercent(project: ReelProject): number {
  if (project.status !== "processing") return 100;
  return overallProgressPercent(project.completedSteps ?? 0, project.currentStepShare ?? 0);
}

/** Asks the PC about every reel still processing and saves what it says. */
async function checkGenerationsInProgress() {
  const processing = getState().projects.filter((project) => project.status === "processing");
  await Promise.all(
    processing.map(async (project) => {
      const status = await fetchGenerationStatus(project.id);
      if (status) applyGenerationStatus(project.id, status);
    }),
  );
}

function applyGenerationStatus(projectId: string, status: GenerationStatus) {
  if (status.status === "running") {
    updateProject(projectId, (project) => ({
      ...project,
      completedSteps: status.completedSteps,
      currentStepShare: status.currentStepShare,
    }));
  } else if (status.status === "done" && status.draft) {
    const { draft, usedSampleContent, aiNote, speechNote } = status;
    updateProject(projectId, (project) => ({ ...project, status: "ready", draft, usedSampleContent, aiNote, speechNote }));
  } else {
    const message =
      status.status === "failed"
        ? (status.errorMessage ?? "We couldn't make this reel.")
        : status.status === "missing"
          ? "The app was closed while this reel was being made."
          : "We couldn't make this reel."; // "done" without a draft
    markGenerationFailed(projectId, message);
  }
}

/** Marks a reel as Failed and gives its credits back. */
export function markGenerationFailed(projectId: string, failureMessage: string) {
  const state = getState();
  const project = state.projects.find((item) => item.id === projectId);
  if (!project || project.status !== "processing") return;
  setState({
    credits: state.credits + project.creditsCharged,
    projects: state.projects.map((item) => (item.id === projectId ? { ...item, status: "failed", failureMessage } : item)),
  });
}

export function updateDraft(projectId: string, change: (draft: ReelDraft) => ReelDraft) {
  // Any edit makes an earlier rendered MP4 out of date.
  updateProject(projectId, (project) =>
    project.draft ? { ...project, draft: change(project.draft), renderedReelId: null } : project,
  );
}

type RegenerateResult = { ok: true } | { ok: false; error: string };

/** Switches caption style. Free up to 2 times per reel (PRD: Pricing → Regenerate). */
export function regenerateWithStyle(projectId: string, captionStyle: CaptionStyleId): RegenerateResult {
  const project = getState().projects.find((item) => item.id === projectId);
  if (!project) return { ok: false, error: "Reel not found." };
  if (project.regenerationsUsed >= FREE_REGENERATIONS_PER_REEL) {
    return { ok: false, error: "You've used both free style changes for this reel." };
  }
  updateProject(projectId, (item) => ({
    ...item,
    style: { ...item.style, captionStyle },
    regenerationsUsed: item.regenerationsUsed + 1,
    renderedReelId: null,
  }));
  return { ok: true };
}

export function freeRegenerationsLeft(project: ReelProject): number {
  return Math.max(0, FREE_REGENERATIONS_PER_REEL - project.regenerationsUsed);
}

/** Saves the finished MP4 and marks the reel Exported. */
export function saveRenderedReel(projectId: string, renderedReelId: string) {
  updateProject(projectId, (project) => ({ ...project, renderedReelId, status: "exported" }));
}

// ---------- Helpers ----------

/** "kopi-senja_promo.mp4" → "Kopi senja promo" */
function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Untitled reel";
  return base.charAt(0).toUpperCase() + base.slice(1);
}
