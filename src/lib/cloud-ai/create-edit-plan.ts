import "server-only";

import type { EditPlan, EditPlanRequest } from "@/lib/cloud-ai/edit-plan-types";
import { requestEditPlanFromClaude } from "@/lib/cloud-ai/request-edit-plan-from-claude";
import { requestEditPlanFromGroq } from "@/lib/cloud-ai/request-edit-plan-from-groq";

// Picks the AI company used by the online service. Set RACIK_AI_PROVIDER in Vercel:
//   "groq"   (default) – free tier, needs GROQ_API_KEY
//   "claude"           – paid, needs ANTHROPIC_API_KEY

type AiProvider = "groq" | "claude";

const PROVIDER_KEY_NAME: Record<AiProvider, string> = {
  groq: "GROQ_API_KEY",
  claude: "ANTHROPIC_API_KEY",
};

export function activeAiProvider(): AiProvider {
  return process.env.RACIK_AI_PROVIDER === "claude" ? "claude" : "groq";
}

/** True when the chosen provider's API key is set on the server. */
export function isAiProviderConfigured(): boolean {
  return Boolean(process.env[PROVIDER_KEY_NAME[activeAiProvider()]]);
}

export function createEditPlan(request: EditPlanRequest): Promise<EditPlan> {
  return activeAiProvider() === "claude" ? requestEditPlanFromClaude(request) : requestEditPlanFromGroq(request);
}
