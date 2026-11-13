"use client";

import type { DraftChange } from "@/components/review/edit-panels/draft-change-type";
import { formatDuration } from "@/lib/reel-options/upload-rules";
import type { CaptionCue, ReelDraft } from "@/lib/reel-project-types";

// Fix caption words inline (PRD F9). Tapping the time jumps the preview to that caption.
export function CaptionsEditPanel({
  draft,
  onChange,
  onSeek,
}: {
  draft: ReelDraft;
  onChange: DraftChange;
  onSeek: (seconds: number) => void;
}) {
  function updateCue(cueId: string, text: string) {
    onChange((d) => ({
      ...d,
      captions: d.captions.map((cue) => (cue.id === cueId ? { ...cue, text, highlightWord: keepHighlight(cue, text) } : cue)),
    }));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-muted">Tap a line to fix a word. Highlighted keywords stay in colour.</p>
      {draft.captions.map((cue) => (
        <div key={cue.id} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
          <button
            type="button"
            onClick={() => onSeek(cue.startSeconds)}
            className="w-10 shrink-0 text-left text-xs tabular-nums text-ink-muted hover:text-brand"
          >
            {formatDuration(cue.startSeconds)}
          </button>
          <input
            value={cue.text}
            aria-label={`Caption at ${formatDuration(cue.startSeconds)}`}
            onFocus={() => onSeek(cue.startSeconds)}
            onChange={(event) => updateCue(cue.id, event.target.value)}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none"
          />
        </div>
      ))}
    </div>
  );
}

/** Drops the keyword highlight if the user removed that word. */
function keepHighlight(cue: CaptionCue, newText: string): string | null {
  if (!cue.highlightWord) return null;
  return newText.toLowerCase().includes(cue.highlightWord.toLowerCase()) ? cue.highlightWord : null;
}
