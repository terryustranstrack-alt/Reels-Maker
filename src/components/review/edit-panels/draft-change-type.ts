import type { ReelDraft } from "@/lib/reel-project-types";

/** Every edit panel receives this to save a change to the draft. */
export type DraftChange = (change: (draft: ReelDraft) => ReelDraft) => void;
