// Rounded pill button that can be selected (reel length, hook style, platforms).

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
  variant?: "solid" | "outline"; // solid = mint fill when selected, outline = mint border
  className?: string;
};

export function ChoiceChip({ label, selected, onSelect, variant = "solid", className = "" }: ChoiceChipProps) {
  const selectedClasses =
    variant === "solid"
      ? "bg-brand text-canvas border-brand"
      : "bg-brand-deep text-brand border-brand-line";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
        selected ? selectedClasses : "border-line bg-surface text-ink-soft hover:bg-surface-hover"
      } ${className}`}
    >
      {label}
    </button>
  );
}
