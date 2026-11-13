"use client";

import { useState } from "react";

// AI-written post caption + hashtags with a Copy button (PRD F17).
export function PostCaptionCard({ caption, hashtags }: { caption: string; hashtags: string[] }) {
  const [copied, setCopied] = useState(false);
  const fullText = `${caption}\n${hashtags.join(" ")}`;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false); // clipboard blocked by the browser
    }
  }

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Post caption</h2>
        <button type="button" onClick={copyToClipboard} className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink-soft">
        <p>{caption}</p>
        <p className="mt-1 text-ink-muted">{hashtags.join(" ")}</p>
      </div>
    </section>
  );
}
