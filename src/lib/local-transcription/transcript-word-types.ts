/** One spoken word with its start and end time in seconds. */
export type TranscriptWord = { text: string; startSeconds: number; endSeconds: number };

export type Transcript = {
  language: string;
  words: TranscriptWord[];
  audioTrackCount?: number; // how many sound tracks the video has (0 = silent video)
};
