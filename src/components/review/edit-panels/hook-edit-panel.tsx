"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import type { ReelDraft } from "@/lib/reel-project-types";
import type { DraftChange } from "@/components/review/edit-panels/draft-change-type";

// Pick one of 3 AI hooks or write your own (PRD F5), plus cold open (F6).
export function HookEditPanel({ draft, onChange }: { draft: ReelDraft; onChange: DraftChange }) {
  const usingCustom = draft.selectedHookIndex < 0;

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-muted">Pick a hook for the first 3 seconds.</p>
      {draft.hookOptions.map((hook, index) => (
        <HookOption
          key={index}
          text={hook}
          selected={draft.selectedHookIndex === index}
          onSelect={() => onChange((d) => ({ ...d, selectedHookIndex: index }))}
        />
      ))}

      <label className="block pt-1">
        <span className="mb-1.5 block text-xs text-ink-soft">Your own hook</span>
        <input
          value={draft.customHook}
          placeholder="Type a hook…"
          maxLength={80}
          onFocus={() => draft.customHook && onChange((d) => ({ ...d, selectedHookIndex: -1 }))}
          onChange={(event) => onChange((d) => ({ ...d, customHook: event.target.value, selectedHookIndex: -1 }))}
          className={`w-full rounded-xl border bg-surface px-3.5 py-3 text-sm outline-none placeholder:text-ink-muted ${
            usingCustom ? "border-brand" : "border-line"
          }`}
        />
      </label>

      <ToggleSwitch
        label="Cold open (best moment first)"
        checked={draft.coldOpen}
        onChange={(on) => onChange((d) => ({ ...d, coldOpen: on }))}
      />
    </div>
  );
}

function HookOption({ text, selected, onSelect }: { text: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm ${
        selected ? "border-brand bg-surface ring-1 ring-brand" : "border-line bg-surface"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-brand" : "border-line-strong"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
      </span>
      {text}
    </button>
  );
}
