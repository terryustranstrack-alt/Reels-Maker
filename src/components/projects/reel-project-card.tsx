"use client";

import Link from "next/link";
import { demoProgressPercent } from "@/lib/demo-store/demo-project-store";
import { activeHookText, type ReelProject } from "@/lib/reel-project-types";

// One reel in the "Recent reels" grid and the Projects library (PRD F18).
export function ReelProjectCard({ project, now }: { project: ReelProject; now: number }) {
  const href =
    project.status === "processing" ? `/projects/${project.id}/generating` : `/projects/${project.id}/review`;
  const progress = project.status === "processing" ? demoProgressPercent(project, now) : 100;

  return (
    <Link href={href} className="block">
      <div className="relative flex aspect-[4/3] flex-col justify-between rounded-2xl bg-surface-raised p-3">
        <StatusPill project={project} progress={progress} />
        {project.status === "processing" ? (
          <div className="h-1.5 w-full rounded-full bg-line-strong">
            <div className="h-full rounded-full bg-warn" style={{ width: `${progress}%` }} />
          </div>
        ) : (
          project.draft && (
            <p className="line-clamp-2 text-xs font-bold uppercase leading-snug">{activeHookText(project.draft)}</p>
          )
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium">{project.title}</p>
    </Link>
  );
}

function StatusPill({ project, progress }: { project: ReelProject; progress: number }) {
  const styles: Record<ReelProject["status"], [string, string]> = {
    processing: [`Processing ${progress}%`, "text-warn"],
    ready: ["Ready", "text-brand"],
    exported: ["Exported", "text-info"],
    failed: ["Failed", "text-warn"],
  };
  const [label, colour] = styles[project.status];
  return (
    <span className={`self-start rounded-lg bg-canvas/80 px-2 py-1 text-xs font-semibold ${colour}`}>{label}</span>
  );
}
