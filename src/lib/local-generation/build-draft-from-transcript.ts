import type { TranscriptWord } from "@/lib/local-transcription/transcript-word-types";
import type { ReelStyleSettings } from "@/lib/reel-options/reel-style-options";
import type { CaptionCue, ReelDraft } from "@/lib/reel-project-types";

// Builds the reel draft from the real transcript, without AI.
// Captions are real. Hooks, trim point and post caption are simple rules for now;
// the Claude edit plan (online service) will replace those later.

const MAX_WORDS_PER_CAPTION = 4;
const MAX_CAPTION_SECONDS = 2.2;
const PAUSE_STARTS_NEW_CAPTION = 0.6;
const MIN_REEL_SECONDS = 3;

// Common Bahasa Indonesia and English words that should never be highlighted or used as hashtags.
const STOP_WORDS = new Set(
  (
    "yang dan atau tapi untuk dengan dari pada dalam karena kalau jadi juga sudah belum akan bisa harus " +
    "mereka kita kami saya aku kamu anda ini itu sini sana sangat banget lebih paling seperti adalah " +
    "semua bikin jangan pertama kedua ketiga terlalu cuma banyak sedikit begitu gimana kenapa tetap " +
    "supaya agar memang emang terus lagi sekali gitu dulu nanti " +
    "the and that this with from have will would could should there their about which because really " +
    "these those what when where while your you're they're"
  ).split(" "),
);

export function buildDraftFromTranscript(
  words: TranscriptWord[],
  style: ReelStyleSettings,
  sourceDurationSeconds: number,
): ReelDraft {
  const durationSeconds = chooseReelLength(words, style.lengthSeconds, sourceDurationSeconds);
  const wordsInReel = words.filter((word) => word.startSeconds < durationSeconds);
  const sentences = splitIntoSentences(wordsInReel);
  const allSentences = splitIntoSentences(words); // a hook may tease something said later

  return {
    durationSeconds,
    hookOptions: buildHookOptions(allSentences, style.language),
    selectedHookIndex: 0,
    customHook: "",
    coldOpen: false,
    captions: groupWordsIntoCaptions(wordsInReel, durationSeconds),
    brollClips: [], // stock clips come with the online service
    musicTrackId: null, // music library not connected yet
    effects: { zoomPunchIns: true, transitions: true, soundEffects: true },
    postCaption: sentences.slice(0, 2).join(" "),
    hashtags: pickHashtags(wordsInReel),
  };
}

// ---------- Reel length ----------

/** Ends the reel at a sentence end close to the target length, never after the video ends. */
export function chooseReelLength(words: TranscriptWord[], targetSeconds: number, sourceSeconds: number): number {
  const videoEnd = sourceSeconds > 0 ? sourceSeconds : targetSeconds;
  const limit = Math.min(targetSeconds, videoEnd);
  const lastSpoken = words.at(-1)?.endSeconds ?? 0;

  if (words.length === 0) return roundTenth(Math.max(MIN_REEL_SECONDS, limit));
  if (lastSpoken <= limit) return roundTenth(Math.max(MIN_REEL_SECONDS, Math.min(videoEnd, lastSpoken + 0.5)));

  const fitting = words.filter((word) => word.endSeconds <= limit);
  const sentenceEnd = [...fitting].reverse().find((word) => endsSentence(word.text) && word.endSeconds >= limit * 0.6);
  const cutAt = (sentenceEnd ?? fitting.at(-1))?.endSeconds ?? limit;
  return roundTenth(Math.max(MIN_REEL_SECONDS, Math.min(limit, cutAt + 0.3)));
}

// ---------- Captions ----------

/** Groups words into short caption lines (max 4 words or 2.2 s, new line after a pause or sentence end). */
export function groupWordsIntoCaptions(words: TranscriptWord[], reelSeconds: number): CaptionCue[] {
  const groups: TranscriptWord[][] = [];
  for (const word of words) {
    const current = groups.at(-1);
    if (!current || shouldStartNewCaption(current, word)) groups.push([word]);
    else current.push(word);
  }
  return groups.map((group, index) => toCaptionCue(group, index, groups[index + 1], reelSeconds));
}

function shouldStartNewCaption(current: TranscriptWord[], next: TranscriptWord): boolean {
  const first = current[0];
  const last = current.at(-1)!;
  return (
    current.length >= MAX_WORDS_PER_CAPTION ||
    next.endSeconds - first.startSeconds > MAX_CAPTION_SECONDS ||
    next.startSeconds - last.endSeconds > PAUSE_STARTS_NEW_CAPTION ||
    /[.,!?;:]$/.test(last.text)
  );
}

function toCaptionCue(group: TranscriptWord[], index: number, nextGroup: TranscriptWord[] | undefined, reelSeconds: number): CaptionCue {
  const text = group.map((word) => cleanCaptionWord(word.text)).filter(Boolean).join(" ");
  const nextStart = nextGroup?.[0].startSeconds;
  const lastEnd = group.at(-1)!.endSeconds;
  // Keep the caption on screen until the next one starts, if the gap is small (less flicker).
  const end = nextStart !== undefined && nextStart - lastEnd < 0.3 ? nextStart : lastEnd;
  return {
    id: `cue-${index + 1}`,
    text,
    startSeconds: roundTenth(group[0].startSeconds),
    endSeconds: roundTenth(Math.min(reelSeconds, Math.max(end, group[0].startSeconds + 0.3))),
    highlightWord: pickHighlightWord(text),
  };
}

/** Captions read better without commas and full stops; keep ? and !. */
function cleanCaptionWord(word: string): string {
  return word.replace(/[.,;:]+$/g, "");
}

/** Highlights the longest meaningful word (5+ letters) in the line, if any. */
export function pickHighlightWord(text: string): string | null {
  const candidates = text
    .split(" ")
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length >= 5 && !STOP_WORDS.has(word.toLowerCase()));
  if (candidates.length === 0) return null;
  return candidates.reduce((longest, word) => (word.length > longest.length ? word : longest)).toUpperCase();
}

// ---------- Hooks, post caption, hashtags ----------

function splitIntoSentences(words: TranscriptWord[]): string[] {
  const sentences: string[] = [];
  let current: string[] = [];
  for (const word of words) {
    current.push(word.text);
    if (endsSentence(word.text)) {
      sentences.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) sentences.push(current.join(" "));
  return sentences.map((sentence) => sentence.trim()).filter(Boolean);
}

/** Three hook options taken from the speaker's own sentences (placeholder until AI hooks). */
function buildHookOptions(allSentences: string[], language: ReelStyleSettings["language"]): string[] {
  const sentences = allSentences.filter((sentence) => sentence.split(" ").length >= 4); // skip "Halo semua."
  const withNumber = sentences.find((sentence) => /\d/.test(sentence));
  const question = sentences.find((sentence) => sentence.endsWith("?"));
  const picks = [sentences[0], withNumber, question, sentences[1], sentences[2]]
    .filter((sentence): sentence is string => Boolean(sentence))
    .map(shortenHook);
  const unique = [...new Set(picks)].slice(0, 3);
  // No speech found: offer one generic hook instead of an empty list.
  if (unique.length === 0) unique.push(language === "en" ? "Watch this till the end" : "Simak sampai habis!");
  return unique;
}

/** Hooks must be short: at most 8 words, no trailing comma or full stop. */
function shortenHook(sentence: string): string {
  const words = sentence.split(" ");
  const short = words.slice(0, 8).join(" ").replace(/[.,;:]+$/, "");
  return words.length > 8 ? `${short}…` : short;
}

/** The 3 most repeated meaningful words become hashtags. */
function pickHashtags(words: TranscriptWord[]): string[] {
  const counts = new Map<string, number>();
  for (const word of words) {
    const clean = word.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    if (clean.length >= 5 && !STOP_WORDS.has(clean)) counts.set(clean, (counts.get(clean) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => `#${word}`);
}

// ---------- Small helpers ----------

function endsSentence(text: string): boolean {
  return /[.!?]$/.test(text);
}

function roundTenth(value: number): number {
  return Math.round(value * 10) / 10;
}
