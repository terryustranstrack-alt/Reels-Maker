"use client";

import { formatDuration } from "@/lib/reel-options/upload-rules";
import type { ReelDraft } from "@/lib/reel-project-types";

// Read-only track overview on the desktop editor: Hook, Video, B-roll, Captions, Music.
// Clicking anywhere moves the playhead.
export function ReviewTimeline({
  draft,
  currentTime,
  onSeek,
}: {
  draft: ReelDraft;
  currentTime: number;
  onSeek: (seconds: number) => void;
}) {
  const duration = draft.durationSeconds;
  const toPercent = (seconds: number) => `${(seconds / duration) * 100}%`;
  const tickTimes = [0, 0.25, 0.5, 0.75, 1].map((share) => share * duration);

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(duration, ((event.clientX - box.left) / box.width) * duration)));
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="grid grid-cols-[72px_1fr] gap-y-3 text-xs text-ink-muted">
        <span />
        <div className="flex justify-between">
          {tickTimes.map((time) => (
            <span key={time}>{formatDuration(time)}</span>
          ))}
        </div>

        <TrackLabel>Hook</TrackLabel>
        <Track onClick={handleClick} currentPercent={toPercent(currentTime)}>
          <Block left="0%" width={toPercent(Math.min(3, duration))} className="bg-white" />
        </Track>

        <TrackLabel>Video</TrackLabel>
        <Track onClick={handleClick} currentPercent={toPercent(currentTime)}>
          <Block left="0%" width="100%" className="bg-line-strong" />
        </Track>

        <TrackLabel>B-roll</TrackLabel>
        <Track onClick={handleClick} currentPercent={toPercent(currentTime)}>
          {draft.brollClips.map((clip) => (
            <Block key={clip.id} left={toPercent(clip.startSeconds)} width={toPercent(clip.endSeconds - clip.startSeconds)} className="bg-warn" />
          ))}
        </Track>

        <TrackLabel>Captions</TrackLabel>
        <Track onClick={handleClick} currentPercent={toPercent(currentTime)}>
          {draft.captions.map((cue) => (
            <Block key={cue.id} left={toPercent(cue.startSeconds)} width={`calc(${toPercent(cue.endSeconds - cue.startSeconds)} - 3px)`} className="bg-brand" />
          ))}
        </Track>

        <TrackLabel>Music</TrackLabel>
        <Track onClick={handleClick} currentPercent={toPercent(currentTime)}>
          {draft.musicTrackId && <Block left="0%" width="100%" className="bg-info" />}
        </Track>
      </div>
    </div>
  );
}

function TrackLabel({ children }: { children: React.ReactNode }) {
  return <span className="flex h-6 items-center">{children}</span>;
}

function Track({
  children,
  onClick,
  currentPercent,
}: {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  currentPercent: string;
}) {
  return (
    <div onClick={onClick} className="relative h-6 cursor-pointer">
      {children}
      <span className="pointer-events-none absolute -top-1 -bottom-1 w-0.5 bg-white/80" style={{ left: currentPercent }} />
    </div>
  );
}

function Block({ left, width, className }: { left: string; width: string; className: string }) {
  return <span className={`absolute inset-y-0 rounded-md ${className}`} style={{ left, width }} />;
}
