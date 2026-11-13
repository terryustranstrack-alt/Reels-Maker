import "server-only";

import ffmpegStaticPath from "ffmpeg-static";
import path from "node:path";

/** FFmpeg program to run: the copy shipped with the Windows app, else the one installed with npm. */
export function findFfmpegBinary(): string {
  return process.env.RACIK_FFMPEG_PATH || ffmpegStaticPath || "ffmpeg";
}

/** Folder with the Poppins font files used for burned-in captions. */
export function findCaptionFontsDir(): string {
  return process.env.RACIK_FONTS_DIR || path.join(process.cwd(), "assets", "fonts");
}
