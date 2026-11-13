import { hasValidAccessCode } from "@/lib/cloud-ai/check-access-code";

// "Test connection" from the app's Account page: checks the access code without calling Claude.
export async function GET(request: Request) {
  if (!hasValidAccessCode(request)) {
    return Response.json({ ok: false, error: "Wrong or missing access code." }, { status: 401 });
  }
  return Response.json({ ok: true, aiReady: Boolean(process.env.ANTHROPIC_API_KEY) });
}
