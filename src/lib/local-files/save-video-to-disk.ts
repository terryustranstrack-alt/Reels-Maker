"use client";

/**
 * Sends the chosen video to the app's local server, which saves it on this PC's disk.
 * Uses XMLHttpRequest because fetch() can't report upload progress.
 */
export function saveVideoToDisk(file: File, onProgress: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/local/source-videos");
    request.setRequestHeader("x-file-name", encodeURIComponent(file.name));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      const body = safeJson(request.responseText);
      if (request.status === 200 && typeof body.videoId === "string") resolve(body.videoId);
      else reject(new Error(typeof body.error === "string" ? body.error : "Saving the video failed."));
    };
    request.onerror = () => reject(new Error("Saving the video failed."));
    request.send(file);
  });
}

function safeJson(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
