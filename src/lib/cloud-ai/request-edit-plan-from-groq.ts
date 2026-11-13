import "server-only";

import { z } from "zod";
import { EDIT_PLAN_SYSTEM_PROMPT, buildEditPlanUserMessage } from "@/lib/cloud-ai/build-edit-plan-prompt";
import { type EditPlan, type EditPlanRequest, EditPlanSchema } from "@/lib/cloud-ai/edit-plan-types";

// Asks Groq (free tier, open models) for the reel's edit plan. Needs GROQ_API_KEY on the online service.
// Groq's JSON mode is not always followed exactly, so every answer is checked and retried once.

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const ATTEMPTS = 2;

const EDIT_PLAN_JSON_SCHEMA = z.toJSONSchema(EditPlanSchema);

export async function requestEditPlanFromGroq(request: EditPlanRequest): Promise<EditPlan> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      return parseGroqEditPlan(await callGroq(request));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/** One chat request; returns Groq's raw JSON response body. */
async function callGroq(request: EditPlanRequest): Promise<unknown> {
  const response = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: process.env.RACIK_GROQ_MODEL || DEFAULT_GROQ_MODEL,
      messages: [
        { role: "system", content: `${EDIT_PLAN_SYSTEM_PROMPT}\n\nReply with a JSON object only, matching the given schema.` },
        { role: "user", content: buildEditPlanUserMessage(request) },
      ],
      response_format: { type: "json_schema", json_schema: { name: "edit_plan", schema: EDIT_PLAN_JSON_SCHEMA } },
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`Groq answered ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json();
}

/** Pulls the edit plan out of Groq's chat response and checks it has every field we need. */
export function parseGroqEditPlan(responseBody: unknown): EditPlan {
  const content = (responseBody as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no answer.");
  const json = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""); // tolerate ```json fences
  return EditPlanSchema.parse(JSON.parse(json));
}
