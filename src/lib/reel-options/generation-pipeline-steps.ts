// The steps the render worker runs for every reel (PRD: Core user flow, step 3).
// The progress screen and the future worker both use this list, so keep the ids stable.

export type PipelineStepId =
  | "transcribe"
  | "cleanup"
  | "trim"
  | "hook"
  | "reframe"
  | "captions"
  | "broll"
  | "effects-render";

export type PipelineStep = {
  id: PipelineStepId;
  label: string; // shown on the "Making your reel" screen
  weight: number; // rough share of total time, used for the % ring
};

export const GENERATION_PIPELINE_STEPS: PipelineStep[] = [
  { id: "transcribe", label: "Transcribing speech", weight: 15 },
  { id: "cleanup", label: "Cutting silences and filler words", weight: 10 },
  { id: "trim", label: "Picking the strongest moment", weight: 10 },
  { id: "hook", label: "Writing your hook", weight: 10 },
  { id: "reframe", label: "Reframing to 9:16", weight: 15 },
  { id: "captions", label: "Adding animated captions", weight: 10 },
  { id: "broll", label: "Finding matching B-roll", weight: 10 },
  { id: "effects-render", label: "Adding zooms, music and rendering", weight: 20 },
];

const TOTAL_WEIGHT = GENERATION_PIPELINE_STEPS.reduce((sum, step) => sum + step.weight, 0);

/** Overall percentage (0–100) when `completedSteps` steps are done and the current one is `currentStepShare` (0–1) through. */
export function overallProgressPercent(completedSteps: number, currentStepShare: number): number {
  const doneWeight = GENERATION_PIPELINE_STEPS.slice(0, completedSteps).reduce((sum, s) => sum + s.weight, 0);
  const currentWeight = GENERATION_PIPELINE_STEPS[completedSteps]?.weight ?? 0;
  return Math.min(100, Math.round(((doneWeight + currentWeight * currentStepShare) / TOTAL_WEIGHT) * 100));
}
