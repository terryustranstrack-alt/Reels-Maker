import type { TimedSentence } from "@/lib/cloud-ai/edit-plan-types";
import type { TranscriptWord } from "@/lib/local-transcription/transcript-word-types";

/** Joins words into sentences with start/end times. A sentence ends at . ! ? or after a long pause. */
export function toTimedSentences(words: TranscriptWord[]): TimedSentence[] {
  const sentences: TimedSentence[] = [];
  let current: TranscriptWord[] = [];

  words.forEach((word, index) => {
    current.push(word);
    const next = words[index + 1];
    const longPause = next !== undefined && next.startSeconds - word.endSeconds > 1.2;
    if (/[.!?]$/.test(word.text) || longPause || !next) {
      sentences.push({
        startSeconds: round(current[0].startSeconds),
        endSeconds: round(word.endSeconds),
        text: current.map((item) => item.text).join(" "),
      });
      current = [];
    }
  });
  return sentences;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
