"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PipelineStepList } from "@/components/generating/pipeline-step-list";
import { ProgressRing } from "@/components/generating/progress-ring";
import { ScreenHeader } from "@/components/layout/screen-header";
import {
  generationProgressPercent,
  useDemoProject,
  useGenerationTicker,
  useIsStoreReady,
} from "@/lib/demo-store/demo-project-store";
import { useProjectIdParam } from "@/lib/use-project-id-param";

// Screen 03 — Making your reel. Opens the review screen automatically when the draft is ready.
export function GenerationProgressView() {
  const projectId = useProjectIdParam();
  const router = useRouter();
  useGenerationTicker();
  const isReady = useIsStoreReady();
  const project = useDemoProject(projectId);
  const isFinished = project?.status === "ready" || project?.status === "exported";

  useEffect(() => {
    if (isFinished) router.replace(`/projects/${projectId}/review`);
  }, [isFinished, projectId, router]);

  if (!isReady) return null;
  if (!project) return <ProjectNotFound />;
  if (project.status === "failed") return <GenerationFailed message={project.failureMessage} />;

  const completedSteps = project.completedSteps ?? 0;
  const percent = generationProgressPercent(project);

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title="Making your reel" backHref="/" icon="close" />
      <ProgressRing percent={percent} caption={progressCaption(completedSteps)} />
      <div className="mt-8 flex-1">
        <PipelineStepList completedSteps={isFinished ? 99 : completedSteps} />
      </div>
      <div className="pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
        <p className="mb-4 text-xs text-ink-muted">You can leave this screen. Keep the app open until it&apos;s done.</p>
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

/** Listening to the speech is the slow part, then the AI plans the reel online. */
function progressCaption(completedSteps: number): string {
  if (completedSteps === 0) return "listening to your video…";
  if (completedSteps === 1) return "AI is planning your reel…";
  return "almost done";
}

/** Shown when the PC couldn't make the reel. Credits have already been given back. */
function GenerationFailed({ message }: { message?: string | null }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-lg font-semibold">This reel couldn&apos;t be made</h1>
      <p className="mt-2 text-sm text-ink-muted">{message ?? "Something went wrong."}</p>
      <p className="mt-1 text-sm text-ink-muted">Your credits have been returned.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-semibold text-canvas">
        Try another video
      </Link>
    </div>
  );
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
