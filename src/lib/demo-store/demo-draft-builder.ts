// Builds a sample AI draft for demo mode.
// In production this comes from the worker (transcript + Claude edit plan); here it is fixed sample content.

import type { ReelStyleSettings } from "@/lib/reel-options/reel-style-options";
import type { BrollClip, CaptionCue, ReelDraft } from "@/lib/reel-project-types";

const SAMPLE_HOOKS = [
  "3 kesalahan yang bikin kedai kopi sepi",
  "Kenapa kopi kamu gak laku?",
  "Promo ini bikin pelanggan balik lagi",
];

// Each line becomes one caption cue; the second value is the highlighted keyword.
const SAMPLE_CAPTION_LINES: [string, string | null][] = [
  ["Jangan diskon terus", "DISKON"],
  ["Pelanggan cuma nunggu promo", "PROMO"],
  ["Coba bundling kopi plus roti", "BUNDLING"],
  ["Margin tetap aman", "AMAN"],
  ["Kedua, menu terlalu banyak", "MENU"],
  ["Fokus ke tiga andalan", null],
  ["Ketiga, lupa minta review", "REVIEW"],
  ["Simpan biar gak lupa!", null],
];

const SAMPLE_BROLL_KEYWORDS = ["coffee shop", "pastry bread", "customer review"];

/** Spreads the sample caption lines evenly across the reel. */
function buildSampleCaptions(durationSeconds: number): CaptionCue[] {
  const cueLength = durationSeconds / SAMPLE_CAPTION_LINES.length;
  return SAMPLE_CAPTION_LINES.map(([text, highlightWord], index) => ({
    id: `cue-${index + 1}`,
    text,
    highlightWord,
    startSeconds: round(index * cueLength),
    endSeconds: round((index + 1) * cueLength),
  }));
}

/** Places one short B-roll clip in each third of the reel (after the hook). */
function buildSampleBroll(durationSeconds: number): BrollClip[] {
  const clipLength = Math.min(3, durationSeconds / 8);
  return SAMPLE_BROLL_KEYWORDS.map((keyword, index) => {
    const start = round(durationSeconds * (0.15 + index * 0.27));
    return {
      id: `broll-${index + 1}`,
      keyword,
      startSeconds: start,
      endSeconds: round(start + clipLength),
      layout: index === 1 ? "picture-in-picture" : "full-screen",
      source: "Pexels",
    };
  });
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildDemoDraft(style: ReelStyleSettings, sourceDurationSeconds: number): ReelDraft {
  // The reel is never longer than the source video.
  const durationSeconds = Math.max(5, Math.min(style.lengthSeconds, Math.round(sourceDurationSeconds) || style.lengthSeconds));
  return {
    durationSeconds,
    hookOptions: SAMPLE_HOOKS,
    selectedHookIndex: 0,
    customHook: "",
    coldOpen: false,
    captions: buildSampleCaptions(durationSeconds),
    brollClips: style.autoBroll ? buildSampleBroll(durationSeconds) : [],
    musicTrackId: style.autoMusic ? "upbeat-sunrise" : null,
    effects: { zoomPunchIns: true, transitions: true, soundEffects: true },
    postCaption:
      "Diskon terus bikin pelanggan cuma nunggu promo. Coba bundling kopi + roti, margin tetap aman. Simpan biar gak lupa!",
    hashtags: ["#umkm", "#kedaikopi", "#tipsbisnis"],
  };
}
