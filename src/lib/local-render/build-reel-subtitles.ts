import type { CaptionStyleId } from "@/lib/reel-options/reel-style-options";
import { activeHookText, type CaptionCue, type ReelDraft } from "@/lib/reel-project-types";

// Turns the draft's hook and captions into an ASS subtitle file that FFmpeg burns into the video.
// ASS colours are written &HAABBGGRR (blue-green-red, not RGB).

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const HOOK_SECONDS = 3;

const WHITE = "&H00FFFFFF";
const NEAR_BLACK = "&H00191919";
const BLACK = "&H00000000";

/** Caption look per style, matching the preview in the app. */
const CAPTION_STYLE_LINES: Record<CaptionStyleId, { style: string; highlightColour: string; uppercase: boolean }> = {
  "bold-hype": {
    // Font, size, text, (unused), outline, shadow, bold, italic, border style, outline px, shadow px
    style: assStyle("Caption", "Poppins", 84, WHITE, BLACK, BLACK, true, false, 1, 5, 2),
    highlightColour: "&H00A4D15C", // mint
    uppercase: true,
  },
  "clean-corporate": {
    style: assStyle("Caption", "Poppins SemiBold", 64, WHITE, "&H005F3A1F", "&H00000000", false, false, 3, 14, 0),
    highlightColour: "&H00FFC47C", // light blue
    uppercase: false,
  },
  "soft-lifestyle": {
    style: assStyle("Caption", "Poppins SemiBold", 66, WHITE, BLACK, "&H80000000", false, true, 1, 2, 3),
    highlightColour: "&H00A4D15C",
    uppercase: false,
  },
  "edu-explainer": {
    style: assStyle("Caption", "Poppins", 74, WHITE, BLACK, BLACK, true, false, 1, 5, 2),
    highlightColour: "&H004C8AFF", // orange
    uppercase: false,
  },
};

// Hook headline: dark text on a white box near the top (BorderStyle 3 = box).
const HOOK_STYLE = assStyle("Hook", "Poppins", 80, NEAR_BLACK, WHITE, "&H00000000", true, false, 3, 16, 0, 8, 230);

export function buildReelSubtitles(draft: ReelDraft, captionStyle: CaptionStyleId): string {
  const look = CAPTION_STYLE_LINES[captionStyle];
  const hookText = cleanText(activeHookText(draft)).toUpperCase();
  const hookEnd = Math.min(HOOK_SECONDS, draft.durationSeconds);

  const events = [
    hookText ? dialogue("Hook", 0, hookEnd, hookText) : null,
    ...draft.captions
      .filter((cue) => cue.startSeconds < draft.durationSeconds && cue.text.trim())
      .map((cue) =>
        dialogue("Caption", cue.startSeconds, Math.min(cue.endSeconds, draft.durationSeconds), captionLine(cue, look)),
      ),
  ].filter(Boolean);

  return [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${VIDEO_WIDTH}`,
    `PlayResY: ${VIDEO_HEIGHT}`,
    "WrapStyle: 0",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    HOOK_STYLE,
    look.style,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ...events,
    "",
  ].join("\n");
}

/** Caption text with the keyword coloured, e.g. "JANGAN {\c&H..&}DISKON{\r} TERUS". */
function captionLine(cue: CaptionCue, look: { highlightColour: string; uppercase: boolean }): string {
  const words = cleanText(cue.text).split(" ");
  const keyword = cue.highlightWord?.toLowerCase();
  return words
    .map((word) => {
      const shown = look.uppercase ? word.toUpperCase() : word;
      return keyword && word.toLowerCase().startsWith(keyword) ? `{\\c${look.highlightColour}&}${shown}{\\r}` : shown;
    })
    .join(" ");
}

/** Removes characters that have a special meaning in ASS files. */
function cleanText(text: string): string {
  return text.replace(/[{}\\]/g, "").replace(/\s+/g, " ").trim();
}

function dialogue(style: string, start: number, end: number, text: string): string {
  return `Dialogue: 0,${assTime(start)},${assTime(end)},${style},,0,0,0,,${text}`;
}

/** 72.5 → "0:01:12.50" */
function assTime(totalSeconds: number): string {
  const centiseconds = Math.round(Math.max(0, totalSeconds) * 100);
  const hours = Math.floor(centiseconds / 360000);
  const minutes = Math.floor((centiseconds % 360000) / 6000);
  const seconds = Math.floor((centiseconds % 6000) / 100);
  const rest = centiseconds % 100;
  return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(rest)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function assStyle(
  name: string,
  font: string,
  size: number,
  textColour: string,
  outlineColour: string,
  backColour: string,
  bold: boolean,
  italic: boolean,
  borderStyle: 1 | 3,
  outline: number,
  shadow: number,
  alignment = 2, // 2 = bottom centre, 8 = top centre
  marginV = 340,
): string {
  return `Style: ${name},${font},${size},${textColour},${textColour},${outlineColour},${backColour},${bold ? -1 : 0},${italic ? -1 : 0},0,0,100,100,0,0,${borderStyle},${outline},${shadow},${alignment},70,70,${marginV},1`;
}
