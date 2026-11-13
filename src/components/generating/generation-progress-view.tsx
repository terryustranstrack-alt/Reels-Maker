"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PipelineStepList } from "@/components/generating/pipeline-step-list";
import { ProgressRing } from "@/components/generating/progress-ring";
import { ScreenHeader } from "@/components/layout/screen-header";
import {
  demoGenerationProgress,
  demoProgressPercent,
  useDemoProject,
  useGenerationTicker,
  useIsStoreReady,
} from "@/lib/demo-store/demo-project-store";
import { useCurrentTime } from "@/lib/use-current-time";
import { useProjectIdParam } from "@/lib/use-project-id-param";

// Screen 03 — Making your reel. Opens the review screen automatically when the draft is ready.
export function GenerationProgressView() {
  const projectId = useProjectIdParam();
  const router = useRouter();
  useGenerationTicker();
  const now = useCurrentTime(500);
  const isReady = useIsStoreReady();
  const project = useDemoProject(projectId);
  const isFinished = project !== undefined && project.status !== "processing";

  useEffect(() => {
    if (isFinished) router.replace(`/projects/${projectId}/review`);
  }, [isFinished, projectId, router]);

  if (!isReady || now === 0) return null;
  if (!project) return <ProjectNotFound />;

  const { completedSteps, remainingMs } = demoGenerationProgress(project, now);
  const percent = isFinished ? 100 : demoProgressPercent(project, now);

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title="Making your reel" backHref="/" icon="close" />
      <ProgressRing percent={percent} caption={remainingTimeLabel(remainingMs)} />
      <div className="mt-8 flex-1">
        <PipelineStepList completedSteps={isFinished ? 99 : completedSteps} />
      </div>
      <div className="pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
        <p className="mb-4 text-xs text-ink-muted">You can close this page. We&apos;ll notify you when it&apos;s ready.</p>
        <button
          type="button"
          disabled
          className="w-full rounded-xl border border-line bg-surface py-4 font-semibold text-ink disabled:opacity-80"
        >
          Preview when ready
        </button>
      </div>
    </div>
  );
}

function remainingTimeLabel(remainingMs: number): string {
  const seconds = Math.ceil(remainingMs / 1000);
  if (seconds <= 0) return "almost done";
  if (seconds < 60) return `about ${seconds} s left`;
  return `about ${Math.round(seconds / 60)} min left`;
}

export function ProjectNotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-ink-muted">We couldn&apos;t find this reel.</p>
      <Link href="/projects" className="mt-4 inline-block font-semibold text-brand">
        Back to projects
      </Link>
    </div>
  );
}
