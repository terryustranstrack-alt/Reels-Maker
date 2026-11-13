import { CAPTION_STYLE_PRESETS, type CaptionStyleId } from "@/lib/reel-options/reel-style-options";

type CaptionStylePickerProps = {
  value: CaptionStyleId;
  onChange: (id: CaptionStyleId) => void;
};

// 2×2 grid of caption style cards with a live sample of each style.
export function CaptionStylePicker({ value, onChange }: CaptionStylePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {CAPTION_STYLE_PRESETS.map((preset) => {
        const selected = preset.id === value;
        return (
          <button
            key={preset.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(preset.id)}
            className={`rounded-2xl border-2 p-2.5 text-left transition-colors ${
              selected ? "border-brand bg-surface" : "border-transparent bg-surface ring-1 ring-line"
            }`}
          >
            <div className="flex h-16 items-center justify-center rounded-xl bg-surface-raised">
              <span className={`text-sm ${preset.chipClassName}`}>{preset.sampleText}</span>
            </div>
            <p className="mt-2.5 text-sm font-semibold">{preset.name}</p>
          </button>
        );
      })}
    </div>
  );
}
