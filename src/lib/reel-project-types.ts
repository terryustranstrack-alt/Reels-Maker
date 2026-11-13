// Shape of a reel project. Mirrors the `reel_projects` table in supabase/migrations.

import type { ReelStyleSettings } from "@/lib/reel-options/reel-style-options";

export type ReelProjectStatus = "processing" | "ready" | "exported" | "failed";

export type CaptionCue = {
  id: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
  highlightWord: string | null; // keyword shown in the accent colour
};

export type BrollClip = {
  id: string;
  keyword: string; // transcript keyword it was matched to
  startSeconds: number;
  endSeconds: number;
  layout: "full-screen" | "picture-in-picture";
  source: "Pexels" | "Pixabay";
};

export type ReelEffects = {
  zoomPunchIns: boolean;
  transitions: boolean;
  soundEffects: boolean;
};

export type ReelDraft = {
  durationSeconds: number;
  hookOptions: string[]; // 3 AI hooks (PRD F5)
  selectedHookIndex: number; // -1 means the custom hook is used
  customHook: string;
  coldOpen: boolean;
  captions: CaptionCue[];
  brollClips: BrollClip[];
  musicTrackId: string | null;
  effects: ReelEffects;
  postCaption: string;
  hashtags: string[];
};

export type ReelProject = {
  id: string;
  title: string;
  sourceFileName: string;
  sourceDurationSeconds: number;
  createdAt: number;
  status: ReelProjectStatus;
  style: ReelStyleSettings;
  creditsCharged: number;
  generationStartedAt: number;
  regenerationsUsed: number; // style regenerations, free up to 2 (PRD: Pricing)
  draft: ReelDraft | null;
};

/** The hook text currently shown in the first 3 seconds. */
export function activeHookText(draft: ReelDraft): string {
  if (draft.selectedHookIndex < 0) return draft.customHook;
  return draft.hookOptions[draft.selectedHookIndex] ?? "";
}
