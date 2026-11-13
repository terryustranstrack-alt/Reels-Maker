"use client";

import { useState } from "react";
import { DownloadIcon } from "@/components/ui/app-icons";
import { saveRenderedReel } from "@/lib/demo-store/demo-project-store";
import type { ReelProject } from "@/lib/reel-project-types";

// Renders the final 1080×1920 MP4 on this PC, then offers it for download (PRD F16, F17).
export function RenderAndDownloadButton({ project }: { project: ReelProject }) {
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function renderReel() {
    setIsRendering(true);
    setError(null);
    try {
      const response = await fetch("/api/local/rendered-reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceVideoId: project.sourceVideoId,
          draft: project.draft,
          captionStyle: project.style.captionStyle,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Rendering failed.");
      saveRenderedReel(project.id, body.renderId);
    } catch (renderError) {
      setError(renderError instanceof Error ? renderError.message : "Rendering failed.");
    } finally {
      setIsRendering(false);
    }
  }

  const buttonClasses =
    "mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-canvas disabled:opacity-60";

  if (!project.sourceVideoId) {
    return (
      <>
        <button type="button" disabled className={buttonClasses}>
          <DownloadIcon size={20} /> Download MP4
        </button>
        <p className="mt-2 text-center text-xs text-ink-muted">The original video for this reel wasn&apos;t saved, so it can&apos;t be rendered.</p>
      </>
    );
  }

  if (project.renderedReelId) {
    const downloadHref = `/api/local/rendered-reels/${project.renderedReelId}?name=${encodeURIComponent(project.title)}`;
    return (
      <a href={downloadHref} download className={buttonClasses}>
        <DownloadIcon size={20} /> Download MP4
      </a>
    );
  }

  return (
    <>
      <button type="button" disabled={isRendering} onClick={renderReel} className={buttonClasses}>
        <DownloadIcon size={20} />
        {isRendering ? "Rendering on this PC…" : "Render MP4"}
      </button>
      <p className="mt-2 text-center text-xs text-ink-muted">
        {isRendering ? "This takes about 30 seconds to 2 minutes. Keep the app open." : "Your reel is rendered on this computer."}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-warn">
          {error}
        </p>
      )}
    </>
  );
}
