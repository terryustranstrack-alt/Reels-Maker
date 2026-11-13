// Upload limits from PRD requirement F1.

export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_VIDEO_SECONDS = 3 * 60; // 3 minutes

/** Returns an error message, or null when the file type and size are fine. */
export function checkVideoFileBasics(file: File): string | null {
  const lowerName = file.name.toLowerCase();
  const typeOk =
    ALLOWED_VIDEO_MIME_TYPES.includes(file.type) ||
    ALLOWED_VIDEO_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
  if (!typeOk) return "Please upload an MP4, MOV or WEBM video.";
  if (file.size > MAX_VIDEO_BYTES) return "This video is larger than 500 MB.";
  return null;
}

/** Reads the video's length in the browser without uploading it. */
export function readVideoDurationSeconds(objectUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => reject(new Error("We couldn't read this video."));
    video.src = objectUrl;
  });
}

/** Formats seconds as m:ss, e.g. 72 → "1:12". */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
