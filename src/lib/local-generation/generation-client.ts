"use client";

import type { ReelDraft, ReelProject } from "@/lib/reel-project-types";

// Browser side of "Generate reel": asks the app's local server to start, then checks progress.

export type GenerationStatus =
  | { status: "running"; completedSteps: number; currentStepShare: number }
  | { status: "done"; draft: ReelDraft | null; usedSampleContent: boolean; aiNote?: string | null; speechNote?: string | null }
  | { status: "failed"; errorMessage: string | null }
  | { status: "missing" }; // the PC has no record of it (app closed mid-way)

/** Starts the generation job for a new reel. Resolves to an error message, or null when it started. */
export async function startLocalGeneration(project: ReelProject): Promise<string | null> {
  try {
    const response = await fetch("/api/local/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        sourceVideoId: project.sourceVideoId,
        sourceDurationSeconds: project.sourceDurationSeconds,
        style: project.style,
      }),
    });
    if (response.ok) return null;
    const body = await response.json().catch(() => ({}));
    return body.error ?? "Couldn't start making the reel.";
  } catch {
    return "Couldn't start making the reel.";
  }
}

/** Latest progress, or null if the local server didn't answer (we simply try again later). */
export async function fetchGenerationStatus(projectId: string): Promise<GenerationStatus | null> {
  try {
    const response = await fetch(`/api/local/generations/${projectId}`, { cache: "no-store" });
    return response.ok ? ((await response.json()) as GenerationStatus) : null;
  } catch {
    return null;
  }
}
