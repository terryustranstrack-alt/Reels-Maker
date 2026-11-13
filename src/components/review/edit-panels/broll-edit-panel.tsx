"use client";

import type { DraftChange } from "@/components/review/edit-panels/draft-change-type";
import { TrashIcon } from "@/components/ui/app-icons";
import { formatDuration } from "@/lib/reel-options/upload-rules";
import type { BrollClip, ReelDraft } from "@/lib/reel-project-types";

// Review the auto-inserted stock clips (PRD F10): switch layout or remove a clip.
// Swapping / searching a replacement is P1 (F11).
export function BrollEditPanel({ draft, onChange }: { draft: ReelDraft; onChange: DraftChange }) {
  function removeClip(clipId: string) {
    onChange((d) => ({ ...d, brollClips: d.brollClips.filter((clip) => clip.id !== clipId) }));
  }

  function toggleLayout(clipId: string) {
    onChange((d) => ({
      ...d,
      brollClips: d.brollClips.map((clip) =>
        clip.id === clipId
          ? { ...clip, layout: clip.layout === "full-screen" ? "picture-in-picture" : "full-screen" }
          : clip,
      ),
    }));
  }

  if (draft.brollClips.length === 0) {
    return <p className="text-sm text-ink-muted">No B-roll in this reel.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-muted">Stock clips matched to what you say.</p>
      {draft.brollClips.map((clip) => (
        <BrollRow key={clip.id} clip={clip} onToggleLayout={() => toggleLayout(clip.id)} onRemove={() => removeClip(clip.id)} />
      ))}
    </div>
  );
}

function BrollRow({ clip, onToggleLayout, onRemove }: { clip: BrollClip; onToggleLayout: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5">
      <div className="h-14 w-10 shrink-0 rounded-md bg-warn/30" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium capitalize">{clip.keyword}</p>
        <p className="text-xs text-ink-muted">
          {formatDuration(clip.startSeconds)}–{formatDuration(clip.endSeconds)} · {clip.source}
        </p>
      </div>
      <button type="button" onClick={onToggleLayout} className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-soft">
        {clip.layout === "full-screen" ? "Full screen" : "Picture-in-picture"}
      </button>
      <button type="button" aria-label="Remove clip" onClick={onRemove} className="p-1.5 text-ink-muted hover:text-warn">
        <TrashIcon size={18} />
      </button>
    </div>
  );
}
