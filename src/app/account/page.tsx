import { AiServiceSettingsForm } from "@/components/account/ai-service-settings-form";
import { AppShell } from "@/components/layout/app-shell";

// Account: AI service settings now; sign-in, plans and billing come with Supabase and Midtrans/Xendit (PRD F19, F20).
export default function AccountPage() {
  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-bold">Account</h1>
      <p className="text-ink-muted">Sign-in, plans and credit top-ups are coming soon.</p>
      <AiServiceSettingsForm />
    </AppShell>
  );
}
