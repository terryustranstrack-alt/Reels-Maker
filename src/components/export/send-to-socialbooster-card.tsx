"use client";

import { useState } from "react";
import { ChoiceChip } from "@/components/ui/choice-chip";

const TARGET_PLATFORMS = ["Instagram Reels", "TikTok", "Facebook", "YouTube Shorts"];

// Push the reel to SocialBooster as a draft post (PRD: SocialBooster integration).
// Account linking and the POST /api/posts/draft call are not built yet, so sending is disabled.
export function SendToSocialBoosterCard() {
  const [platforms, setPlatforms] = useState<string[]>(["Instagram Reels", "TikTok"]);
  const isConnected = false;

  function togglePlatform(platform: string) {
    setPlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Send to SocialBooster</h2>
        <span className={`text-sm font-medium ${isConnected ? "text-brand" : "text-ink-muted"}`}>
          {isConnected ? "Connected" : "Not connected"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {TARGET_PLATFORMS.map((platform) => (
          <ChoiceChip
            key={platform}
            label={platform}
            variant="outline"
            selected={platforms.includes(platform)}
            onSelect={() => togglePlatform(platform)}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-muted">Saved as a draft post, ready to schedule.</p>
      <button
        type="button"
        disabled={!isConnected || platforms.length === 0}
        className="mt-4 w-full rounded-xl bg-white py-3.5 font-semibold text-canvas disabled:opacity-40"
      >
        Send as draft
      </button>
      {!isConnected && (
        <p className="mt-2 text-center text-xs text-ink-muted">Linking a SocialBooster workspace is coming soon.</p>
      )}
    </section>
  );
}
