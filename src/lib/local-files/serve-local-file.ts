import "server-only";

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

/**
 * Streams a file from disk. Supports "Range" requests so the video player can seek.
 * `downloadName` makes the browser save the file instead of playing it.
 */
export async function serveLocalFile(request: Request, filePath: string, downloadName?: string): Promise<Response> {
  const info = await stat(filePath).catch(() => null);
  if (!info) return new Response("Not found", { status: 404 });

  const extension = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const headers = new Headers({
    "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
  });
  if (downloadName) headers.set("Content-Disposition", `attachment; filename="${downloadName.replace(/"/g, "")}"`);

  const range = parseRange(request.headers.get("range"), info.size);
  if (!range) {
    headers.set("Content-Length", String(info.size));
    return new Response(toWebStream(createReadStream(filePath)), { status: 200, headers });
  }

  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${info.size}`);
  headers.set("Content-Length", String(range.end - range.start + 1));
  return new Response(toWebStream(createReadStream(filePath, range)), { status: 206, headers });
}

/** "bytes=100-" → { start: 100, end: size - 1 }. Returns null when there is no usable range. */
function parseRange(header: string | null, size: number): { start: number; end: number } | null {
  const match = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (match[1] === "" && match[2] === "")) return null;
  const start = match[1] === "" ? Math.max(0, size - Number(match[2])) : Number(match[1]);
  const end = match[1] !== "" && match[2] !== "" ? Math.min(Number(match[2]), size - 1) : size - 1;
  return start <= end ? { start, end } : null;
}

function toWebStream(stream: Readable): ReadableStream {
  return Readable.toWeb(stream) as ReadableStream;
}
