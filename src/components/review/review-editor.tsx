"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ProjectNotFound } from "@/components/generating/generation-progress-view";
import { AppLogo } from "@/components/layout/app-logo";
import { ScreenHeader } from "@/components/layout/screen-header";
import { BrollEditPanel } from "@/components/review/edit-panels/broll-edit-panel";
import { CaptionsEditPanel } from "@/components/review/edit-panels/captions-edit-panel";
import type { DraftChange } from "@/components/review/edit-panels/draft-change-type";
import { EffectsEditPanel } from "@/components/review/edit-panels/effects-edit-panel";
import { HookEditPanel } from "@/components/review/edit-panels/hook-edit-panel";
import { MusicEditPanel } from "@/components/review/edit-panels/music-edit-panel";
import { StyleEditPanel } from "@/components/review/edit-panels/style-edit-panel";
import { ReelPreviewPlayer } from "@/components/review/reel-preview-player";
import { ReviewTimeline } from "@/components/review/review-timeline";
import {
  getSourceVideoUrl,
  updateDraft,
  useDemoProject,
  useDemoState,
  useIsStoreReady,
} from "@/lib/demo-store/demo-project-store";
import type { ReelDraft, ReelProject } from "@/lib/reel-project-types";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { useProjectIdParam } from "@/lib/use-project-id-param";

type EditTab = "hook" | "captions" | "broll" | "effects" | "music" | "style";

const EDIT_TABS: { id: EditTab; label: string; desktopLabel?: string; description: string }[] = [
  { id: "hook", label: "Hook", description: "Shown in the first 3 seconds. Pick one of the AI options or write your own." },
  { id: "captions", label: "Captions", description: "Fix any word the transcription got wrong." },
  { id: "broll", label: "B-roll", description: "Stock clips inserted where they match your words." },
  { id: "effects", label: "Effects", description: "Zooms, transitions and sound effects." },
  { id: "music", label: "Music", description: "Background music for the whole reel." },
  { id: "style", label: "Style", desktopLabel: "Style and brand kit", description: "Change the caption look." },
];

// Screen 04 — Review and quick edit. Phone: preview + tabs. Desktop: sidebar, preview + timeline, settings panel.
export function ReviewEditor() {
  const projectId = useProjectIdParam();
  const isReady = useIsStoreReady();
  const project = useDemoProject(projectId);

  if (!isReady) return null;
  if (!project) return <ProjectNotFound />;
  if (!project.draft) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-muted">This reel is still being made.</p>
        <Link href={`/projects/${projectId}/generating`} className="mt-4 inline-block font-semibold text-brand">
          See progress
        </Link>
      </div>
    );
  }
  return <ReviewEditorLayout project={project} draft={project.draft} />;
}

function ReviewEditorLayout({ project, draft }: { project: ReelProject; draft: ReelDraft }) {
  const [activeTab, setActiveTab] = useState<EditTab>("hook");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceVideoUrl] = useState(() => getSourceVideoUrl(project.id));
  const isDesktop = useIsDesktop();

  const handleDraftChange: DraftChange = useCallback((change) => updateDraft(project.id, change), [project.id]);
  const seekTo = useCallback((seconds: number) => setCurrentTime(seconds), []);
  const exportHref = `/projects/${project.id}/export`;
  const activeTabInfo = EDIT_TABS.find((tab) => tab.id === activeTab)!;

  const preview = (
    <ReelPreviewPlayer
      draft={draft}
      captionStyle={project.style.captionStyle}
      sourceVideoUrl={sourceVideoUrl}
      currentTime={currentTime}
      isPlaying={isPlaying}
      onTimeChange={setCurrentTime}
      onPlayingChange={setIsPlaying}
      className="mx-auto w-[200px] lg:w-[270px]"
    />
  );

  const panel = (
    <ActivePanel tab={activeTab} project={project} draft={draft} onChange={handleDraftChange} onSeek={seekTo} />
  );

  // Only one layout is mounted at a time, so there is only ever one video player.
  if (!isDesktop) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-10">
        <ScreenHeader
          title="Your reel is ready"
          backHref="/projects"
          right={<Link href={exportHref} className="rounded-xl bg-brand px-5 py-3 font-semibold text-canvas">Export</Link>}
        />
        {preview}
        {!sourceVideoUrl && <SourceVideoNote />}
        <div className="mt-6 flex overflow-x-auto border-b border-line [scrollbar-width:none]">
          {EDIT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-[84px] flex-1 border-b-2 px-3 py-3 text-sm ${
                activeTab === tab.id ? "border-brand font-semibold text-ink" : "border-transparent text-ink-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4">{panel}</div>
      </div>
    );
  }

  return (
      <div className="flex min-h-dvh flex-col">
        <DesktopTopBar project={project} exportHref={exportHref} onRegenerate={() => setActiveTab("style")} />
        <div className="grid flex-1 grid-cols-[220px_1fr_300px]">
          <aside className="border-r border-line px-3 py-6">
            <p className="mb-3 px-3 text-xs text-ink-muted">Quick edits (optional)</p>
            {EDIT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`mb-1 block w-full rounded-xl border px-3 py-3 text-left text-sm ${
                  activeTab === tab.id ? "border-brand-line bg-brand-deep font-semibold text-brand" : "border-transparent text-ink-soft hover:bg-surface"
                }`}
              >
                {tab.desktopLabel ?? tab.label}
              </button>
            ))}
          </aside>
          <section className="flex flex-col gap-5 px-6 py-6">
            {preview}
            {!sourceVideoUrl && <SourceVideoNote />}
            <ReviewTimeline draft={draft} currentTime={currentTime} onSeek={seekTo} />
          </section>
          <aside className="border-l border-line px-5 py-6">
            <h2 className="font-semibold">{activeTabInfo.desktopLabel ?? activeTabInfo.label}</h2>
            <p className="mt-2 mb-4 text-sm text-ink-muted">{activeTabInfo.description}</p>
            {panel}
          </aside>
        </div>
      </div>
  );
}

function ActivePanel({
  tab,
  project,
  draft,
  onChange,
  onSeek,
}: {
  tab: EditTab;
  project: ReelProject;
  draft: ReelDraft;
  onChange: DraftChange;
  onSeek: (seconds: number) => void;
}) {
  switch (tab) {
    case "hook":
      return <HookEditPanel draft={draft} onChange={onChange} />;
    case "captions":
      return <CaptionsEditPanel draft={draft} onChange={onChange} onSeek={onSeek} />;
    case "broll":
      return <BrollEditPanel draft={draft} onChange={onChange} />;
    case "effects":
      return <EffectsEditPanel draft={draft} onChange={onChange} />;
    case "music":
      return <MusicEditPanel draft={draft} onChange={onChange} />;
    case "style":
      return <StyleEditPanel project={project} />;
  }
}

function DesktopTopBar({ project, exportHref, onRegenerate }: { project: ReelProject; exportHref: string; onRegenerate: () => void }) {
  const { credits } = useDemoState();
  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4">
      <div className="flex items-center gap-4">
        <AppLogo />
        <p className="text-sm text-ink-muted">
          <Link href="/projects" className="hover:text-ink">Projects</Link> / <span className="text-ink">{project.title}</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-ink-muted">{credits} credits</span>
        <button type="button" onClick={onRegenerate} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold">
          Regenerate style
        </button>
        <Link href={exportHref} className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-canvas">
          Export reel
        </Link>
      </div>
    </header>
  );
}

/** The original video only stays in memory in the tab it was uploaded in (until cloud storage is connected). */
function SourceVideoNote() {
  return (
    <p className="mt-2 text-center text-xs text-ink-muted">
      Preview without video: the original file is only kept in the tab it was uploaded in.
    </p>
  );
}
