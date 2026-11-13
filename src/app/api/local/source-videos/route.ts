import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { SOURCE_VIDEOS_DIR, ensureDataFolders } from "@/lib/local-files/local-data-paths";
import { ALLOWED_VIDEO_EXTENSIONS, MAX_VIDEO_BYTES } from "@/lib/reel-options/upload-rules";

// Saves an uploaded video to the PC's disk. The browser sends the raw file as the request body.
export async function POST(request: Request) {
  const fileName = decodeURIComponent(request.headers.get("x-file-name") ?? "");
  const extension = path.extname(fileName).toLowerCase();
  if (!ALLOWED_VIDEO_EXTENSIONS.includes(extension)) {
    return Response.json({ error: "Please upload an MP4, MOV or WEBM video." }, { status: 400 });
  }
  if (!request.body) return Response.json({ error: "No video received." }, { status: 400 });

  await ensureDataFolders();
  const videoId = `${randomUUID()}${extension}`;
  const targetPath = path.join(SOURCE_VIDEOS_DIR, videoId);

  try {
    await pipeline(Readable.fromWeb(request.body as never), limitSize(MAX_VIDEO_BYTES), createWriteStream(targetPath));
  } catch {
    await rm(targetPath, { force: true });
    return Response.json({ error: "Saving the video failed or it is larger than 500 MB." }, { status: 400 });
  }
  return Response.json({ videoId });
}

/** Stops the upload once it passes `maxBytes`. */
function limitSize(maxBytes: number) {
  let received = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding, done) {
      received += chunk.length;
      done(received > maxBytes ? new Error("too large") : null, chunk);
    },
  });
}
