"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PostCaptionCard } from "@/components/export/post-caption-card";
import { SendToSocialBoosterCard } from "@/components/export/send-to-socialbooster-card";
import { ProjectNotFound } from "@/components/generating/generation-progress-view";
import { ScreenHeader } from "@/components/layout/screen-header";
import { DownloadIcon } from "@/components/ui/app-icons";
import { markExported, useDemoProject, useDemoState, useIsStoreReady } from "@/lib/demo-store/demo-project-store";
import { formatDuration } from "@/lib/reel-options/upload-rules";
import { activeHookText } from "@/lib/reel-project-types";
import { useProjectIdParam } from "@/lib/use-project-id-param";

// Screen 05 — Export: download, send to SocialBooster, copy post caption.
export function ExportView() {
  const projectId = useProjectIdParam();
  const isReady = useIsStoreReady();
  const { credits } = useDemoState();
  const project = useDemoProject(projectId);
  const canExport = project?.status === "ready";

  // Opening the export screen counts as exporting in demo mode.
  useEffect(() => {
    if (canExport) markExported(projectId);
  }, [canExport, projectId]);

  if (!isReady) return null;
  if (!project?.draft) return <ProjectNotFound />;
  const { draft } = project;

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Export"
        backHref={`/projects/${projectId}/review`}
        right={<span className="text-xs text-ink-muted">{credits} credits left</span>}
      />

      <div className="flex items-center gap-5">
        <div className="relative flex h-32 w-[88px] shrink-0 items-end rounded-xl bg-surface-raised p-2">
          <span className="line-clamp-2 bg-brand px-1 text-[9px] font-bold uppercase text-canvas">{activeHookText(draft)}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Reel ready to render</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {project.title} · {formatDuration(draft.durationSeconds)}
          </p>
          <p className="text-sm text-ink-muted">MP4 · 1080 × 1920 · 30 fps</p>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-canvas disabled:opacity-50"
      >
        <DownloadIcon size={20} />
        Download MP4
      </button>
      <p className="mt-2 text-center text-xs text-ink-muted">
        Final rendering starts working once the render worker is connected.
      </p>

      <SendToSocialBoosterCard />
      <PostCaptionCard caption={draft.postCaption} hashtags={draft.hashtags} />

      <div className="mt-10 text-center">
        <Link href="/" className="font-semibold text-brand underline underline-offset-4">
          Make another reel
        </Link>
      </div>
    </div>
  );
}
