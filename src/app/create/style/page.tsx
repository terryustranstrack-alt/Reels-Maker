import { ScreenHeader } from "@/components/layout/screen-header";
import { ReelStyleForm } from "@/components/style/reel-style-form";

// Screen 02 — Pick a style.
export default function PickStylePage() {
  return (
    <div className="mx-auto max-w-3xl px-5">
      <ScreenHeader
        title="Pick a style"
        backHref="/"
        right={<span className="text-xs text-ink-muted">Defaults work fine</span>}
      />
      <ReelStyleForm />
    </div>
  );
}
