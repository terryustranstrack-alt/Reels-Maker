import type { EditPlanRequest } from "@/lib/cloud-ai/edit-plan-types";

// The instructions Claude gets for planning one reel.

export const EDIT_PLAN_SYSTEM_PROMPT = `You are an experienced short-form video editor for Indonesian small businesses, agencies and creators.
You turn the transcript of one talking video into an edit plan for a vertical reel (Instagram Reels, TikTok, YouTube Shorts).

What makes a good plan:
- The segment is the strongest continuous part of the talk: a clear point, tip, story or offer that makes sense on its own.
  It starts at the start time of one transcript line and ends at the end time of a later line. Use only times that appear in the transcript.
  Its length is as close as possible to the target length without going over it. If the whole talk is shorter, use all of it.
- Hooks are what viewers read in the first 3 seconds. They must make people stop scrolling and stay true to what is said in the segment.
  Write them in the speaker's language (casual Bahasa Indonesia is fine when the speaker talks that way). Max 8 words, no emojis, no quotes.
- Highlight keywords are single words copied exactly from the segment's transcript (numbers, product names, strong verbs or nouns), not filler words.
- The post caption sounds like the speaker, gives the main takeaway and ends with a soft call to action. Hashtags fit the topic and audience.`;

const HOOK_STYLE_GUIDE: Record<EditPlanRequest["hookStyle"], string> = {
  auto: "Mix styles: one question, one bold claim, one with a number if the content has one.",
  question: "All 3 hooks are questions.",
  "bold-claim": "All 3 hooks are bold claims or surprising statements.",
  "number-list": "All 3 hooks use a number, like a list (e.g. '3 kesalahan ...').",
};

const LANGUAGE_NAME: Record<EditPlanRequest["language"], string> = {
  id: "Bahasa Indonesia",
  en: "English",
  auto: "the same language as the transcript",
};

/** Transcript lines as "[12.3-15.8] text", which Claude uses to pick exact segment times. */
export function buildEditPlanUserMessage(request: EditPlanRequest): string {
  const lines = request.sentences
    .map((sentence) => `[${sentence.startSeconds.toFixed(1)}-${sentence.endSeconds.toFixed(1)}] ${sentence.text}`)
    .join("\n");
  return [
    `Target reel length: ${request.targetSeconds} seconds.`,
    `Hook style: ${HOOK_STYLE_GUIDE[request.hookStyle]}`,
    `Write hooks, post caption and hashtags in ${LANGUAGE_NAME[request.language]}.`,
    "",
    "<transcript>",
    lines,
    "</transcript>",
  ].join("\n");
}
