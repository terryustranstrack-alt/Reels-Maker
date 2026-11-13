"use client";

import { useEffect, useState } from "react";

type SaveResult = { ok: true; aiReady: boolean } | { ok: false; error: string };

// Account page: where the app finds the online AI service (internal alpha: address + access code).
export function AiServiceSettingsForm() {
  const [serviceUrl, setServiceUrl] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [hasSavedCode, setHasSavedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);

  // Load what's already saved (the access code itself is never sent back to the screen).
  useEffect(() => {
    fetch("/api/local/ai-settings")
      .then((response) => response.json())
      .then((saved: { serviceUrl: string; hasAccessCode: boolean }) => {
        setServiceUrl(saved.serviceUrl);
        setHasSavedCode(saved.hasAccessCode);
      })
      .catch(() => {});
  }, []);

  async function saveAndTest(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/local/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceUrl, accessCode }),
      });
      const result = (await response.json()) as SaveResult;
      setMessage(resultMessage(result));
      if (result.ok || response.status !== 400) {
        setHasSavedCode(true);
        setAccessCode("");
      }
    } catch {
      setMessage({ text: "Saving failed. Please try again.", good: false });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={saveAndTest} className="mt-6 max-w-xl rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-semibold">AI service</h2>
      <p className="mt-1 text-sm text-ink-muted">
        AI writes your hooks, picks the best moment and writes the post caption. Videos stay on this PC; only the
        transcript text is sent.
      </p>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block text-ink-soft">Service address</span>
        <input
          value={serviceUrl}
          onChange={(event) => setServiceUrl(event.target.value)}
          placeholder="racik-reels.vercel.app"
          className="w-full rounded-xl border border-line bg-canvas px-3.5 py-3 outline-none focus:border-brand"
        />
      </label>

      <label className="mt-3 block text-sm">
        <span className="mb-1.5 block text-ink-soft">Access code</span>
        <input
          type="password"
          value={accessCode}
          onChange={(event) => setAccessCode(event.target.value)}
          placeholder={hasSavedCode ? "Saved — type a new one to change it" : "Access code"}
          autoComplete="off"
          className="w-full rounded-xl border border-line bg-canvas px-3.5 py-3 outline-none focus:border-brand"
        />
      </label>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 rounded-xl bg-brand px-5 py-3 font-semibold text-canvas disabled:opacity-60"
      >
        {isSaving ? "Testing…" : "Save and test connection"}
      </button>
      {message && (
        <p role="status" className={`mt-3 text-sm ${message.good ? "text-brand" : "text-warn"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}

function resultMessage(result: SaveResult): { text: string; good: boolean } {
  if (!result.ok) return { text: result.error, good: false };
  if (!result.aiReady) return { text: "Connected, but the service has no AI key yet.", good: false };
  return { text: "Connected. New reels will use AI hooks.", good: true };
}
