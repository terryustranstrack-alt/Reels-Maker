import { isSafeFileId } from "@/lib/local-files/local-data-paths";
import { readGenerationJob } from "@/lib/local-generation/generation-jobs";

// Progress of a reel being made, polled by the "Making your reel" screen.
export async function GET(_request: Request, context: RouteContext<"/api/local/generations/[projectId]">) {
  const { projectId } = await context.params;
  if (!isSafeFileId(projectId)) return Response.json({ error: "Not found" }, { status: 404 });

  const job = await readGenerationJob(projectId);
  if (!job) return Response.json({ status: "missing" });
  return Response.json(job);
}
