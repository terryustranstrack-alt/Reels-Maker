import { z } from "zod";

// What the desktop app sends to the online AI service, and what it gets back.
// Shared by both sides so they always agree.

/** One spoken sentence with its time in the source video (seconds). */
export const TimedSentenceSchema = z.object({
  startSeconds: z.number(),
  endSeconds: z.number(),
  text: z.string(),
});
export type TimedSentence = z.infer<typeof TimedSentenceSchema>;

export const EditPlanRequestSchema = z.object({
  sentences: z.array(TimedSentenceSchema).min(1).max(400),
  targetSeconds: z.number().min(5).max(180),
  hookStyle: z.enum(["auto", "question", "bold-claim", "number-list"]),
  language: z.enum(["id", "en", "auto"]),
});
export type EditPlanRequest = z.infer<typeof EditPlanRequestSchema>;

/** Claude's edit plan (PRD: "AI edit plan"). Kept simple so it fits structured outputs. */
export const EditPlanSchema = z.object({
  hooks: z.array(z.string()).describe("Exactly 3 hook headlines, max 8 words each, in the speaker's language"),
  segmentStartSeconds: z.number().describe("Start of the strongest moment: the start time of a sentence"),
  segmentEndSeconds: z.number().describe("End of the strongest moment: the end time of a sentence"),
  highlightKeywords: z.array(z.string()).describe("5-15 single words, exactly as spoken, worth highlighting in captions"),
  brollKeywords: z.array(z.string()).describe("2-5 short English stock-footage search terms"),
  postCaption: z.string().describe("Post caption, 1-3 sentences, in the speaker's language"),
  hashtags: z.array(z.string()).describe("3-6 hashtags, lowercase, each starting with #"),
});
export type EditPlan = z.infer<typeof EditPlanSchema>;
