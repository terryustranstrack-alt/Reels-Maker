import { hasValidAccessCode } from "@/lib/cloud-ai/check-access-code";
import { createEditPlan, isAiProviderConfigured } from "@/lib/cloud-ai/create-edit-plan";
import { EditPlanRequestSchema } from "@/lib/cloud-ai/edit-plan-types";

// Online AI service (Vercel): transcript in, edit plan out (Groq or Claude, see create-edit-plan.ts).
// Called by the Windows app's local server, never directly by the browser.

export const maxDuration = 120;

export async function POST(request: Request) {
  if (!hasValidAccessCode(request)) {
    return Response.json({ error: "Wrong or missing access code." }, { status: 401 });
  }
  if (!isAiProviderConfigured()) {
    return Response.json({ error: "The AI service isn't set up yet (missing AI key)." }, { status: 503 });
  }

  const parsed = EditPlanRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid transcript." }, { status: 400 });

  try {
    const plan = await createEditPlan(parsed.data);
    return Response.json({ plan });
  } catch (error) {
    console.error("Edit plan failed", error);
    return Response.json({ error: "The AI couldn't plan this reel." }, { status: 502 });
  }
}
