import "server-only";

import { ACCESS_CODE_HEADER } from "@/lib/cloud-ai/check-access-code";
import { type EditPlan, type EditPlanRequest, EditPlanSchema } from "@/lib/cloud-ai/edit-plan-types";
import type { AiServiceSettings } from "@/lib/local-ai/ai-service-settings";

// The Windows app's side of the AI step: sends the transcript to the online service and checks the answer.

const AI_TIMEOUT_MS = 120_000;

export async function requestEditPlan(settings: AiServiceSettings, request: EditPlanRequest): Promise<EditPlan> {
  const response = await fetch(`${settings.serviceUrl}/api/cloud/edit-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", [ACCESS_CODE_HEADER]: settings.accessCode },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? `AI service answered ${response.status}`);
  return EditPlanSchema.parse(body.plan);
}

export type ConnectionCheck = { ok: true; aiReady: boolean } | { ok: false; error: string };

/** Used by "Test connection" on the Account page. */
export async function checkAiServiceConnection(settings: AiServiceSettings): Promise<ConnectionCheck> {
  try {
    const response = await fetch(`${settings.serviceUrl}/api/cloud/status`, {
      headers: { [ACCESS_CODE_HEADER]: settings.accessCode },
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) return { ok: false, error: "The access code is wrong." };
    if (!response.ok) return { ok: false, error: `The service answered with an error (${response.status}).` };
    return { ok: true, aiReady: Boolean(body.aiReady) };
  } catch {
    return { ok: false, error: "Couldn't reach the service. Check the address and your internet connection." };
  }
}
