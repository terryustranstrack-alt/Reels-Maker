import { isSafeFileId } from "@/lib/local-files/local-data-paths";
import { renderReelVideo } from "@/lib/local-render/render-reel-video";
import { CAPTION_STYLE_PRESETS, type CaptionStyleId } from "@/lib/reel-options/reel-style-options";
import type { ReelDraft } from "@/lib/reel-project-types";

type RenderRequestBody = { sourceVideoId?: string; draft?: ReelDraft; captionStyle?: CaptionStyleId };

// Renders the final MP4 on this PC. Takes about 30 s – 2 min depending on the computer.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RenderRequestBody;
  const { sourceVideoId, draft, captionStyle } = body;

  if (!sourceVideoId || !isSafeFileId(sourceVideoId) || !draft || !Array.isArray(draft.captions)) {
    return Response.json({ error: "The reel or its original video is missing." }, { status: 400 });
  }
  if (!CAPTION_STYLE_PRESETS.some((preset) => preset.id === captionStyle)) {
    return Response.json({ error: "Unknown caption style." }, { status: 400 });
  }

  try {
    const renderId = await renderReelVideo({ sourceVideoId, draft, captionStyle: captionStyle! });
    return Response.json({ renderId });
  } catch (error) {
    console.error("Render failed", error);
    return Response.json({ error: "Rendering failed. Please try again." }, { status: 500 });
  }
}
