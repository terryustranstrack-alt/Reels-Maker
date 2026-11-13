"use client";

import { useEffect, useRef } from "react";
import { CaptionOverlay, HookOverlay, captionAtTime } from "@/components/review/reel-text-overlays";
import { PauseIcon, PlayIcon } from "@/components/ui/app-icons";
import type { CaptionStyleId } from "@/lib/reel-options/reel-style-options";
import { activeHookText, type ReelDraft } from "@/lib/reel-project-types";

const HOOK_SECONDS = 3; // hook headline shows in the first 3 seconds (PRD F5)

type ReelPreviewPlayerProps = {
  draft: ReelDraft;
  captionStyle: CaptionStyleId;
  sourceVideoUrl: string | null;
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (seconds: number) => void;
  onPlayingChange: (playing: boolean) => void;
  className?: string;
};

// 9:16 preview of the draft reel. Plays the uploaded video when it is still in memory;
// otherwise plays a dark placeholder so captions and hook can still be checked.
export function ReelPreviewPlayer(props: ReelPreviewPlayerProps) {
  const { draft, captionStyle, sourceVideoUrl, currentTime, isPlaying, className = "" } = props;
  const videoRef = useVideoSync(props);
  usePlaceholderClock(props);

  const showHook = currentTime < HOOK_SECONDS || !isPlaying;
  const activeBroll = draft.brollClips.find((clip) => currentTime >= clip.startSeconds && currentTime < clip.endSeconds);

  return (
    <div className={`relative aspect-[9/16] overflow-hidden rounded-3xl bg-surface-raised [container-type:inline-size] ${className}`}>
      {sourceVideoUrl && (
        <video ref={videoRef} src={sourceVideoUrl} playsInline className="absolute inset-0 h-full w-full object-cover" />
      )}
      {activeBroll && <BrollMarker keyword={activeBroll.keyword} layout={activeBroll.layout} />}
      {showHook && <HookOverlay text={activeHookText(draft)} />}
      <CaptionOverlay cue={captionAtTime(draft.captions, currentTime)} captionStyle={captionStyle} />

      <button
        type="button"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={() => props.onPlayingChange(!isPlaying)}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-canvas/90 text-white transition-opacity ${
            isPlaying ? "opacity-0" : "opacity-100"
          }`}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>

      <div className="absolute inset-x-3 bottom-4 h-1 rounded-full bg-white/25">
        <div className="h-full rounded-full bg-white" style={{ width: `${(currentTime / draft.durationSeconds) * 100}%` }} />
      </div>
    </div>
  );
}

/** Placeholder for a stock clip until real Pexels/Pixabay footage is connected. */
function BrollMarker({ keyword, layout }: { keyword: string; layout: string }) {
  const position = layout === "picture-in-picture" ? "right-3 top-[30%] h-1/4 w-2/5" : "inset-0";
  return (
    <div className={`absolute ${position} flex items-center justify-center rounded-lg bg-warn/25 ring-1 ring-warn/60`}>
      <span className="rounded bg-canvas/80 px-2 py-0.5 text-[11px] text-warn">B-roll: {keyword}</span>
    </div>
  );
}

/** Keeps the <video> element in step with the play/pause state and reports its time. */
function useVideoSync({ sourceVideoUrl, isPlaying, currentTime, draft, onTimeChange, onPlayingChange }: ReelPreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.play().catch(() => onPlayingChange(false));
    else video.pause();
  }, [isPlaying, onPlayingChange]);

  // Seek when the time is changed from outside (e.g. clicking the timeline).
  useEffect(() => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - currentTime) > 0.4) video.currentTime = currentTime;
  }, [currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTime = () => {
      if (video.currentTime >= draft.durationSeconds) {
        video.pause();
        onPlayingChange(false);
        onTimeChange(0);
      } else onTimeChange(video.currentTime);
    };
    video.addEventListener("timeupdate", handleTime);
    return () => video.removeEventListener("timeupdate", handleTime);
  }, [sourceVideoUrl, draft.durationSeconds, onTimeChange, onPlayingChange]);

  return videoRef;
}

/** Without a video, advance the time with a timer so the overlays still play back. */
function usePlaceholderClock({ sourceVideoUrl, isPlaying, currentTime, draft, onTimeChange, onPlayingChange }: ReelPreviewPlayerProps) {
  const timeRef = useRef(currentTime);
  useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    if (sourceVideoUrl || !isPlaying) return;
    const stepMs = 100;
    const timer = window.setInterval(() => {
      const next = timeRef.current + stepMs / 1000;
      if (next >= draft.durationSeconds) {
        onPlayingChange(false);
        onTimeChange(0);
      } else onTimeChange(next);
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [sourceVideoUrl, isPlaying, draft.durationSeconds, onTimeChange, onPlayingChange]);
}
