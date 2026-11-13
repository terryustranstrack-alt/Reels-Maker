// Royalty-free music library grouped by mood (PRD F13).
// Placeholder track list until the real licensed library is connected.

export type MusicMood = "Upbeat" | "Calm" | "Corporate" | "Dramatic";

export type MusicTrack = {
  id: string;
  title: string;
  mood: MusicMood;
  durationLabel: string;
};

export const MUSIC_LIBRARY: MusicTrack[] = [
  { id: "upbeat-sunrise", title: "Sunrise Run", mood: "Upbeat", durationLabel: "1:45" },
  { id: "upbeat-street", title: "Street Market", mood: "Upbeat", durationLabel: "2:10" },
  { id: "calm-morning", title: "Morning Tea", mood: "Calm", durationLabel: "2:30" },
  { id: "calm-rain", title: "Soft Rain", mood: "Calm", durationLabel: "1:58" },
  { id: "corporate-forward", title: "Forward Motion", mood: "Corporate", durationLabel: "2:05" },
  { id: "dramatic-reveal", title: "Big Reveal", mood: "Dramatic", durationLabel: "1:30" },
];

export function findMusicTrack(trackId: string | null): MusicTrack | null {
  return MUSIC_LIBRARY.find((track) => track.id === trackId) ?? null;
}
