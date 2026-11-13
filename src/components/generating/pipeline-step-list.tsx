import { CheckIcon } from "@/components/ui/app-icons";
import { GENERATION_PIPELINE_STEPS } from "@/lib/reel-options/generation-pipeline-steps";

// Live checklist of generation steps: done (mint tick), current (orange ring), waiting (grey ring).
export function PipelineStepList({ completedSteps }: { completedSteps: number }) {
  return (
    <ol className="space-y-5">
      {GENERATION_PIPELINE_STEPS.map((step, index) => {
        const state = index < completedSteps ? "done" : index === completedSteps ? "current" : "waiting";
        return (
          <li key={step.id} className="flex items-center gap-4">
            <StepMarker state={state} />
            <span
              className={
                state === "current" ? "font-semibold text-ink" : state === "done" ? "text-ink-soft" : "text-ink-muted"
              }
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepMarker({ state }: { state: "done" | "current" | "waiting" }) {
  if (state === "done") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-canvas">
        <CheckIcon size={14} />
      </span>
    );
  }
  return (
    <span
      className={`h-6 w-6 rounded-full border-2 ${state === "current" ? "animate-pulse border-warn" : "border-line-strong"}`}
    />
  );
}
