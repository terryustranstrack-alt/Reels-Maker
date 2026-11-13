"use client";

import { useState } from "react";
import { CaptionStylePicker } from "@/components/style/caption-style-picker";
import { freeRegenerationsLeft, regenerateWithStyle } from "@/lib/demo-store/demo-project-store";
import type { ReelProject } from "@/lib/reel-project-types";

// Switch caption style after generation. Free up to 2 times per reel (PRD: Pricing).
// Brand kit settings (F15) will live here too once built.
export function StyleEditPanel({ project }: { project: ReelProject }) {
  const [error, setError] = useState<string | null>(null);
  const left = freeRegenerationsLeft(project);

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-muted">
        {left} free style change{left === 1 ? "" : "s"} left for this reel.
      </p>
      <div className="[&>div]:grid-cols-2">
        <CaptionStylePicker
          value={project.style.captionStyle}
          onChange={(id) => {
            if (id === project.style.captionStyle) return;
            const result = regenerateWithStyle(project.id, id);
            setError(result.ok ? null : result.error);
          }}
        />
      </div>
      {error && <p className="text-sm text-warn">{error}</p>}
    </div>
  );
}
