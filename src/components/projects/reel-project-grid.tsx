"use client";

import Link from "next/link";
import { ReelProjectCard } from "@/components/projects/reel-project-card";
import { useDemoState, useGenerationTicker, useIsStoreReady } from "@/lib/demo-store/demo-project-store";

type ReelProjectGridProps = {
  limit?: number; // show only the newest N (Create screen)
  emptyMessage: string;
};

// Grid of reel cards with live "Processing %" updates.
export function ReelProjectGrid({ limit, emptyMessage }: ReelProjectGridProps) {
  useGenerationTicker();
  const isReady = useIsStoreReady();
  const { projects } = useDemoState();
  const visibleProjects = limit ? projects.slice(0, limit) : projects;

  if (!isReady) return null;
  if (visibleProjects.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-surface px-4 py-6 text-center text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {visibleProjects.map((project) => (
        <ReelProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

/** "Recent reels" heading with a "See all" link, used on the Create screen. */
export function RecentReelsSection() {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent reels</h2>
        <Link href="/projects" className="text-sm text-brand">
          See all
        </Link>
      </div>
      <ReelProjectGrid limit={4} emptyMessage="Your reels will show up here." />
    </section>
  );
}
