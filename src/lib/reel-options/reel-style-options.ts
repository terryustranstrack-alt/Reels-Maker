// Choices the user makes on the "Pick a style" screen (PRD: Core user flow, step 2).

export type CaptionStyleId = "bold-hype" | "clean-corporate" | "soft-lifestyle" | "edu-explainer";
export type ReelLengthSeconds = 15 | 30 | 60 | 90;
export type HookStyleId = "auto" | "question" | "bold-claim" | "number-list";
export type ReelLanguage = "id" | "en" | "auto";

export type CaptionStylePreset = {
  id: CaptionStyleId;
  name: string;
  sampleText: string; // shown on the picker card
  chipClassName: string; // Tailwind classes for the sample caption chip
};

export const CAPTION_STYLE_PRESETS: CaptionStylePreset[] = [
  {
    id: "bold-hype",
    name: "Bold Hype",
    sampleText: "GAK NYANGKA",
    chipClassName: "bg-brand text-canvas font-bold uppercase tracking-wide px-2 py-1",
  },
  {
    id: "clean-corporate",
    name: "Clean Corporate",
    sampleText: "Tips hiring 2026",
    chipClassName: "bg-navy text-white font-semibold rounded-md px-2 py-1",
  },
  {
    id: "soft-lifestyle",
    name: "Soft Lifestyle",
    sampleText: "pagi yang tenang",
    chipClassName: "italic text-ink-soft",
  },
  {
    id: "edu-explainer",
    name: "Edu Explainer",
    sampleText: "3 langkah mudah",
    chipClassName: "text-warn font-bold",
  },
];

export const REEL_LENGTH_OPTIONS: ReelLengthSeconds[] = [15, 30, 60, 90];

export const HOOK_STYLE_OPTIONS: { id: HookStyleId; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "question", label: "Question" },
  { id: "bold-claim", label: "Bold claim" },
  { id: "number-list", label: "Number list" },
];

export const LANGUAGE_OPTIONS: { id: ReelLanguage; label: string }[] = [
  { id: "id", label: "Bahasa Indonesia" },
  { id: "en", label: "English" },
  { id: "auto", label: "Auto-detect" },
];

export type ReelStyleSettings = {
  captionStyle: CaptionStyleId;
  lengthSeconds: ReelLengthSeconds;
  hookStyle: HookStyleId;
  language: ReelLanguage;
  autoBroll: boolean;
  autoMusic: boolean;
  cutSilences: boolean;
};

// Smart defaults so the user can skip the style screen entirely.
export const DEFAULT_REEL_STYLE: ReelStyleSettings = {
  captionStyle: "bold-hype",
  lengthSeconds: 30,
  hookStyle: "auto",
  language: "id",
  autoBroll: true,
  autoMusic: true,
  cutSilences: true,
};

/** Credit price of one reel: 1 credit up to 60 s, 2 credits for 90 s (PRD: Pricing). */
export function creditCostForLength(lengthSeconds: ReelLengthSeconds): number {
  return lengthSeconds > 60 ? 2 : 1;
}

export function findCaptionStyle(id: CaptionStyleId): CaptionStylePreset {
  return CAPTION_STYLE_PRESETS.find((preset) => preset.id === id) ?? CAPTION_STYLE_PRESETS[0];
}
