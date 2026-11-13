"use client";

import type { DraftChange } from "@/components/review/edit-panels/draft-change-type";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import type { ReelDraft, ReelEffects } from "@/lib/reel-project-types";

// Turn the automatic effects on or off (PRD F12, F13).
export function EffectsEditPanel({ draft, onChange }: { draft: ReelDraft; onChange: DraftChange }) {
  function setEffect(key: keyof ReelEffects, on: boolean) {
    onChange((d) => ({ ...d, effects: { ...d.effects, [key]: on } }));
  }
  return (
    <div>
      <ToggleSwitch label="Zoom punch-ins on emphasis" checked={draft.effects.zoomPunchIns} onChange={(on) => setEffect("zoomPunchIns", on)} />
      <ToggleSwitch label="Transitions between cuts" checked={draft.effects.transitions} onChange={(on) => setEffect("transitions", on)} />
      <ToggleSwitch label="Sound effects on hook and transitions" checked={draft.effects.soundEffects} onChange={(on) => setEffect("soundEffects", on)} />
    </div>
  );
}
