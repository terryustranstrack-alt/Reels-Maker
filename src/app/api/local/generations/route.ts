import { isSafeFileId } from "@/lib/local-files/local-data-paths";
import { startGenerationJob } from "@/lib/local-generation/generation-jobs";
import type { ReelStyleSettings } from "@/lib/reel-options/reel-style-options";

type StartBody = {
  projectId?: string;
  sourceVideoId?: string;
  sourceDurationSeconds?: number;
  style?: ReelStyleSettings;
};

// Starts making a reel on this PC (transcription, captions, draft). Returns right away.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as StartBody;
  const { projectId, sourceVideoId, sourceDurationSeconds, style } = body;

  if (!projectId || !isSafeFileId(projectId) || !sourceVideoId || !isSafeFileId(sourceVideoId) || !style) {
    return Response.json({ error: "The reel or its video is missing." }, { status: 400 });
  }
  startGenerationJob({ projectId, sourceVideoId, sourceDurationSeconds: Number(sourceDurationSeconds) || 0, style });
  return Response.json({ started: true });
}
