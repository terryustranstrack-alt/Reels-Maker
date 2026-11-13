import "server-only";

import { spawn } from "node:child_process";
import { findFfmpegBinary } from "@/lib/local-render/find-ffmpeg-binary";

// Camera and event footage often has several sound tracks (e.g. a silent camera mic on track 1 and the
// clip-on mic on track 2). Using only the first track can lose the speech, so we mix all of them.

/** Counts the sound tracks in a video by reading FFmpeg's description of the file. */
export function countAudioTracks(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // With only an input, FFmpeg lists the streams and exits with an error code; that's expected.
    const ffmpeg = spawn(findFfmpegBinary(), ["-hide_banner", "-i", videoPath], { windowsHide: true });
    let info = "";
    ffmpeg.stderr.on("data", (chunk: Buffer) => (info += chunk.toString()));
    ffmpeg.on("error", reject);
    ffmpeg.on("close", () => resolve((info.match(/Stream #\d+:\d+[^:]*: Audio:/g) ?? []).length));
  });
}

/** "[0:a:0][0:a:1]" for 2 tracks: the input labels FFmpeg's mixer needs. */
function trackLabels(trackCount: number): string {
  return Array.from({ length: trackCount }, (_, index) => `[0:a:${index}]`).join("");
}

/**
 * FFmpeg arguments for the speech-recognition audio: all tracks mixed, quiet speech made louder.
 * Returns null when the video has no sound at all.
 */
export function speechAudioArgs(trackCount: number): string[] | null {
  if (trackCount === 0) return null;
  const evenOutVolume = "dynaudnorm=f=150:g=15"; // raises quiet speech without clipping loud parts
  if (trackCount === 1) return ["-map", "0:a:0", "-af", evenOutVolume];
  return [
    "-filter_complex", `${trackLabels(trackCount)}amix=inputs=${trackCount}:normalize=0,${evenOutVolume}[speech]`,
    "-map", "[speech]",
  ];
}

/** FFmpeg arguments for the sound of the final reel: all tracks mixed (or no sound if there is none). */
export function reelAudioArgs(trackCount: number): string[] {
  if (trackCount === 0) return ["-an"];
  if (trackCount === 1) return ["-map", "0:a:0"];
  return ["-filter_complex", `${trackLabels(trackCount)}amix=inputs=${trackCount}:normalize=0[mix]`, "-map", "[mix]"];
}
