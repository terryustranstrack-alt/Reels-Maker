import { AppShell } from "@/components/layout/app-shell";

// Brand kit is a P1 feature (PRD F15). This page holds its place in the navigation.
export default function BrandKitPage() {
  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-bold">Brand kit</h1>
      <p className="text-ink-muted">Logo, brand fonts, colours and intro/outro cards are coming soon.</p>
    </AppShell>
  );
}
