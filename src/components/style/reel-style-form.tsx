"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaptionStylePicker } from "@/components/style/caption-style-picker";
import { UploadedFileSummary } from "@/components/style/uploaded-file-summary";
import { SparkleIcon } from "@/components/ui/app-icons";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { getPendingUpload, startGeneration } from "@/lib/demo-store/demo-project-store";
import {
  DEFAULT_REEL_STYLE,
  HOOK_STYLE_OPTIONS,
  LANGUAGE_OPTIONS,
  REEL_LENGTH_OPTIONS,
  creditCostForLength,
  type ReelLanguage,
  type ReelStyleSettings,
} from "@/lib/reel-options/reel-style-options";

// Screen 02 — Pick a style. Everything is pre-filled, so the user can press Generate straight away.
export function ReelStyleForm() {
  const router = useRouter();
  const [upload] = useState(getPendingUpload);
  const [style, setStyle] = useState<ReelStyleSettings>(DEFAULT_REEL_STYLE);
  const [error, setError] = useState<string | null>(null);

  // The chosen file only lives in memory, so a page refresh loses it.
  if (!upload) {
    return (
      <div className="py-10 text-center">
        <p className="text-ink-muted">Choose a video first.</p>
        <Link href="/" className="mt-4 inline-block font-semibold text-brand">
          Go to upload
        </Link>
      </div>
    );
  }

  function changeStyle<K extends keyof ReelStyleSettings>(key: K, value: ReelStyleSettings[K]) {
    setStyle((current) => ({ ...current, [key]: value }));
  }

  function handleGenerate() {
    const result = startGeneration(upload!, style);
    if (!result.ok) return setError(result.error);
    router.push(`/projects/${result.projectId}/generating`);
  }

  const cost = creditCostForLength(style.lengthSeconds);

  return (
    <div className="pb-32">
      <UploadedFileSummary fileName={upload.fileName} durationSeconds={upload.durationSeconds} />

      <FormSection title="Caption style">
        <CaptionStylePicker value={style.captionStyle} onChange={(id) => changeStyle("captionStyle", id)} />
      </FormSection>

      <FormSection title="Reel length">
        <div className="grid grid-cols-4 gap-2 md:max-w-md">
          {REEL_LENGTH_OPTIONS.map((seconds) => (
            <ChoiceChip
              key={seconds}
              label={`${seconds}s`}
              selected={style.lengthSeconds === seconds}
              onSelect={() => changeStyle("lengthSeconds", seconds)}
            />
          ))}
        </div>
      </FormSection>

      <FormSection title="Hook style">
        <div className="flex flex-wrap gap-2">
          {HOOK_STYLE_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.id}
              label={option.label}
              selected={style.hookStyle === option.id}
              onSelect={() => changeStyle("hookStyle", option.id)}
            />
          ))}
        </div>
      </FormSection>

      <section className="mt-6 rounded-2xl border border-line bg-surface px-4 py-2">
        <label className="flex items-center justify-between gap-3 border-b border-line py-3 text-sm">
          <span>Language</span>
          <select
            value={style.language}
            onChange={(event) => changeStyle("language", event.target.value as ReelLanguage)}
            className="bg-transparent text-right text-ink-soft outline-none"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id} className="bg-surface">
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <ToggleSwitch label="Auto B-roll" checked={style.autoBroll} onChange={(on) => changeStyle("autoBroll", on)} />
        <ToggleSwitch label="Background music" checked={style.autoMusic} onChange={(on) => changeStyle("autoMusic", on)} />
        <ToggleSwitch
          label="Cut silences and filler words"
          checked={style.cutSilences}
          onChange={(on) => changeStyle("cutSilences", on)}
        />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl">
          {error && (
            <p role="alert" className="mb-2 text-center text-sm text-warn">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-canvas"
          >
            <SparkleIcon size={18} />
            Generate reel · {cost} credit{cost > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-medium text-ink-soft">{title}</h2>
      {children}
    </section>
  );
}
