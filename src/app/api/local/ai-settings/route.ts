import {
  normalizeServiceUrl,
  readAiServiceSettings,
  saveAiServiceSettings,
} from "@/lib/local-ai/ai-service-settings";
import { checkAiServiceConnection } from "@/lib/local-ai/request-edit-plan";

// AI service settings for the Account page. The access code is never sent back to the screen.

export async function GET() {
  const settings = await readAiServiceSettings();
  return Response.json({ serviceUrl: settings?.serviceUrl ?? "", hasAccessCode: Boolean(settings?.accessCode) });
}

/** Saves the address (and the access code, if a new one was typed), then tests the connection. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { serviceUrl?: string; accessCode?: string };
  const serviceUrl = normalizeServiceUrl(body.serviceUrl ?? "");
  if (!serviceUrl) return Response.json({ ok: false, error: "Please enter the service address." }, { status: 400 });

  const accessCode = body.accessCode?.trim() || (await readAiServiceSettings())?.accessCode;
  if (!accessCode) return Response.json({ ok: false, error: "Please enter the access code." }, { status: 400 });

  const settings = { serviceUrl, accessCode };
  await saveAiServiceSettings(settings);
  return Response.json(await checkAiServiceConnection(settings));
}
