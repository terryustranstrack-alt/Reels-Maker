import path from "node:path";
import { SOURCE_VIDEOS_DIR, isSafeFileId } from "@/lib/local-files/local-data-paths";
import { serveLocalFile } from "@/lib/local-files/serve-local-file";

// Plays an uploaded video back to the preview player.
export async function GET(request: Request, context: RouteContext<"/api/local/source-videos/[videoId]">) {
  const { videoId } = await context.params;
  if (!isSafeFileId(videoId)) return new Response("Not found", { status: 404 });
  return serveLocalFile(request, path.join(SOURCE_VIDEOS_DIR, videoId));
}
