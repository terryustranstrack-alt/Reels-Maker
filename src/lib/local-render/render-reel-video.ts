import "server-only";

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { RENDERED_REELS_DIR, RENDER_WORK_DIR, SOURCE_VIDEOS_DIR, ensureDataFolders } from "@/lib/local-files/local-data-paths";
import { buildReelSubtitles } from "@/lib/local-render/build-reel-subtitles";
import { findCaptionFontsDir, findFfmpegBinary } from "@/lib/local-render/find-ffmpeg-binary";
import { countAudioTracks, reelAudioArgs } from "@/lib/local-render/video-audio-tracks";
import type { CaptionStyleId } from "@/lib/reel-options/reel-style-options";
import type { ReelDraft } from "@/lib/reel-project-types";

// Renders the final 1080×1920, 30 fps MP4 on this PC with FFmpeg (PRD F16).
// Covered now: 9:16 centre crop, the AI-chosen moment trimmed to reel length, hook + captions burned in.
// Not yet: face tracking, B-roll, music, zooms (need the pipeline steps that come later).

type RenderInput = { sourceVideoId: string; draft: ReelDraft; captionStyle: CaptionStyleId };

export async function renderReelVideo({ sourceVideoId, draft, captionStyle }: RenderInput): Promise<string> {
  await ensureDataFolders();
  const renderId = `${randomUUID()}.mp4`;
  const workDir = path.join(RENDER_WORK_DIR, renderId.replace(".mp4", ""));

  const sourcePath = path.join(SOURCE_VIDEOS_DIR, sourceVideoId);

  try {
    await prepareWorkFolder(workDir, buildReelSubtitles(draft, captionStyle));
    const audioArgs = reelAudioArgs(await countAudioTracks(sourcePath)); // mixes all sound tracks
    await runFfmpeg(workDir, [
      "-y",
      // Start at the moment the AI picked (0 if none); placed before -i for a fast, exact seek.
      "-ss", String(draft.sourceStartSeconds ?? 0),
      "-i", sourcePath,
      "-t", String(draft.durationSeconds),
      "-map", "0:v:0",
      ...audioArgs,
      // Fill the 9:16 frame, crop the middle, then burn in the subtitles.
      // Relative file names avoid Windows "C:\" escaping problems inside the filter.
      "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,ass=subtitles.ass:fontsdir=fonts",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k",
      "-movflags", "+faststart",
      path.join(RENDERED_REELS_DIR, renderId),
    ]);
    return renderId;
  } finally {
    await rm(workDir, { recursive: true, force: true }); // keep the disk clean
  }
}

/** Writes the subtitle file and copies the caption fonts next to it. */
async function prepareWorkFolder(workDir: string, subtitles: string) {
  const fontsSource = findCaptionFontsDir();
  const fontsTarget = path.join(workDir, "fonts");
  await mkdir(fontsTarget, { recursive: true });
  await writeFile(path.join(workDir, "subtitles.ass"), subtitles, "utf8");
  const fontFiles = (await readdir(fontsSource)).filter((name) => name.endsWith(".ttf"));
  await Promise.all(fontFiles.map((name) => copyFile(path.join(fontsSource, name), path.join(fontsTarget, name))));
}

/** Runs FFmpeg and rejects with the last lines of its log when it fails. */
function runFfmpeg(workDir: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(findFfmpegBinary(), args, { cwd: workDir, windowsHide: true });
    let log = "";
    ffmpeg.stderr.on("data", (chunk: Buffer) => {
      log = (log + chunk.toString()).slice(-4000);
    });
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg stopped with code ${code}: ${log.split("\n").slice(-6).join("\n")}`));
    });
  });
}
