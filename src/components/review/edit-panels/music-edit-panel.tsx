"use client";

import type { DraftChange } from "@/components/review/edit-panels/draft-change-type";
import { MUSIC_LIBRARY } from "@/lib/reel-options/music-library";
import type { ReelDraft } from "@/lib/reel-project-types";

// Pick background music by mood, or none (PRD F13). Music is auto-ducked under speech at render time.
export function MusicEditPanel({ draft, onChange }: { draft: ReelDraft; onChange: DraftChange }) {
  const options = [{ id: null, title: "No music", mood: "", durationLabel: "" }, ...MUSIC_LIBRARY];

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-muted">Royalty-free tracks. Volume dips automatically when you speak.</p>
      {options.map((track) => {
        const selected = draft.musicTrackId === track.id;
        return (
          <button
            key={track.id ?? "none"}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange((d) => ({ ...d, musicTrackId: track.id }))}
            className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left text-sm ${
              selected ? "border-brand bg-brand-deep" : "border-line bg-surface"
            }`}
          >
            <span className="font-medium">{track.title}</span>
            <span className="text-xs text-ink-muted">
              {[track.mood, track.durationLabel].filter(Boolean).join(" · ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
