import type { Transcript, TranscriptWord } from "@/lib/local-transcription/transcript-word-types";

// Reads the JSON file that whisper-cli writes with `-oj -ml 1 -sow` (one word per segment).
// Shape: { result: { language }, transcription: [{ offsets: { from, to } (ms), text: " word" }] }

type WhisperSegment = { offsets?: { from?: number; to?: number }; text?: string };
type WhisperJson = { result?: { language?: string }; transcription?: WhisperSegment[] };

export function parseWhisperJson(raw: string): Transcript {
  const data = JSON.parse(raw) as WhisperJson;
  const words = (data.transcription ?? []).map(segmentToWord).filter((word): word is TranscriptWord => word !== null);
  return { language: data.result?.language ?? "auto", words };
}

/** Converts one segment; drops empty text and markers like "[BLANK_AUDIO]" or "(music)". */
function segmentToWord(segment: WhisperSegment): TranscriptWord | null {
  const text = (segment.text ?? "").trim();
  if (!text || /^[[(].*[\])]$/.test(text)) return null;
  const from = segment.offsets?.from ?? 0;
  const to = segment.offsets?.to ?? from;
  return { text, startSeconds: from / 1000, endSeconds: Math.max(from, to) / 1000 };
}
