import path from "node:path";
import { RENDERED_REELS_DIR, isSafeFileId } from "@/lib/local-files/local-data-paths";
import { serveLocalFile } from "@/lib/local-files/serve-local-file";

// Downloads a rendered reel. `?name=` sets the file name the user sees.
export async function GET(request: Request, context: RouteContext<"/api/local/rendered-reels/[renderId]">) {
  const { renderId } = await context.params;
  if (!isSafeFileId(renderId)) return new Response("Not found", { status: 404 });

  const requestedName = new URL(request.url).searchParams.get("name") ?? "racik-reel";
  const downloadName = `${requestedName.replace(/[^\w\- ]+/g, "").trim() || "racik-reel"}.mp4`;
  return serveLocalFile(request, path.join(RENDERED_REELS_DIR, renderId), downloadName);
}
