"use client";

// Demo-mode data store. Keeps projects and credits in the browser (localStorage)
// so the whole flow can be clicked through before Supabase and the render worker are connected.
// Every function here has a matching server version planned (see supabase/migrations).

import { useEffect, useSyncExternalStore } from "react";
import { buildDemoDraft } from "@/lib/demo-store/demo-draft-builder";
import { GENERATION_PIPELINE_STEPS, overallProgressPercent } from "@/lib/reel-options/generation-pipeline-steps";
import {
  creditCostForLength,
  type CaptionStyleId,
  type ReelStyleSettings,
} from "@/lib/reel-options/reel-style-options";
import type { ReelDraft, ReelProject } from "@/lib/reel-project-types";

const STORAGE_KEY = "racik-reels-demo-v1";
const STARTING_DEMO_CREDITS = 12;
const FREE_REGENERATIONS_PER_REEL = 2;
/** How long a fake generation takes in demo mode. */
export const DEMO_GENERATION_MS = 20_000;

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

/** Moves finished demo generations to "Ready" while a page that shows them is open. */
export function useGenerationTicker() {
  useEffect(() => {
    settleFinishedGenerations();
    const timer = window.setInterval(settleFinishedGenerations, 1000);
    return () => window.clearInterval(timer);
  }, []);
}

// ---------- Uploaded video held in memory ----------

export type PendingUpload = { fileName: string; durationSeconds: number; objectUrl: string };

let pendingUpload: PendingUpload | null = null;
const sourceVideoUrls = new Map<string, string>(); // projectId → browser object URL

export function setPendingUpload(upload: PendingUpload) {
  pendingUpload = upload;
}

export function getPendingUpload(): PendingUpload | null {
  return pendingUpload;
}

/** The original video for preview. Only available in the same browser tab it was uploaded in. */
export function getSourceVideoUrl(projectId: string): string | null {
  return sourceVideoUrls.get(projectId) ?? null;
}

// ---------- Actions ----------

type StartResult = { ok: true; projectId: string } | { ok: false; error: string };

/** Hard credit check, then charge credits and start a (fake) generation. */
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
    createdAt: Date.now(),
    status: "processing",
    style,
    creditsCharged: cost,
    generationStartedAt: Date.now(),
    regenerationsUsed: 0,
    draft: null,
  };

  sourceVideoUrls.set(projectId, upload.objectUrl);
  pendingUpload = null;
  setState({ credits: state.credits - cost, projects: [project, ...state.projects] });
  return { ok: true, projectId };
}

/** Marks every fake generation whose time is up as Ready, with a sample draft. */
export function settleFinishedGenerations() {
  const state = getState();
  const now = Date.now();
  const finished = state.projects.filter(
    (project) => project.status === "processing" && now - project.generationStartedAt >= DEMO_GENERATION_MS,
  );
  if (finished.length === 0) return;

  setState({
    ...state,
    projects: state.projects.map((project) =>
      finished.includes(project)
        ? { ...project, status: "ready", draft: project.draft ?? buildDemoDraft(project.style, project.sourceDurationSeconds) }
        : project,
    ),
  });
}

/** Demo progress: how many steps are done and how far into the current one (0–1). */
export function demoGenerationProgress(project: ReelProject, now: number) {
  const stepCount = GENERATION_PIPELINE_STEPS.length;
  const share = Math.min(1, (now - project.generationStartedAt) / DEMO_GENERATION_MS);
  const exactStep = share * stepCount;
  const completedSteps = Math.min(stepCount, Math.floor(exactStep));
  return { completedSteps, currentStepShare: exactStep - completedSteps, remainingMs: DEMO_GENERATION_MS * (1 - share) };
}

/** Demo progress as a single 0–100 number. */
export function demoProgressPercent(project: ReelProject, now: number): number {
  const { completedSteps, currentStepShare } = demoGenerationProgress(project, now);
  return overallProgressPercent(completedSteps, currentStepShare);
}

export function updateDraft(projectId: string, change: (draft: ReelDraft) => ReelDraft) {
  updateProject(projectId, (project) => (project.draft ? { ...project, draft: change(project.draft) } : project));
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
  }));
  return { ok: true };
}

export function freeRegenerationsLeft(project: ReelProject): number {
  return Math.max(0, FREE_REGENERATIONS_PER_REEL - project.regenerationsUsed);
}

export function markExported(projectId: string) {
  updateProject(projectId, (project) => ({ ...project, status: "exported" }));
}

// ---------- Helpers ----------

/** "kopi-senja_promo.mp4" → "Kopi senja promo" */
function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Untitled reel";
  return base.charAt(0).toUpperCase() + base.slice(1);
}
