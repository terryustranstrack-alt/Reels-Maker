import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { EDIT_PLAN_SYSTEM_PROMPT, buildEditPlanUserMessage } from "@/lib/cloud-ai/build-edit-plan-prompt";
import { type EditPlan, type EditPlanRequest, EditPlanSchema } from "@/lib/cloud-ai/edit-plan-types";

// Asks Claude for the reel's edit plan. Runs only on the online service (needs ANTHROPIC_API_KEY).

const EDIT_PLAN_MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  client ??= new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
  return client;
}

export async function requestEditPlanFromClaude(request: EditPlanRequest): Promise<EditPlan> {
  const response = await getClient().beta.messages.parse({
    model: EDIT_PLAN_MODEL,
    max_tokens: 16000,
    system: EDIT_PLAN_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildEditPlanUserMessage(request) }],
    output_config: { effort: "medium", format: betaZodOutputFormat(EditPlanSchema) },
    // If Claude declines a request, the API retries it on a suitable fallback model automatically.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  if (response.stop_reason === "refusal") throw new Error("Claude declined to plan this video.");
  if (!response.parsed_output) throw new Error(`No edit plan returned (stop reason: ${response.stop_reason}).`);
  return response.parsed_output;
}
