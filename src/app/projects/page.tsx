import { AppShell } from "@/components/layout/app-shell";
import { ReelProjectGrid } from "@/components/projects/reel-project-grid";

// Projects library: every reel with its status (PRD F18).
export default function ProjectsLibraryPage() {
  return (
    <AppShell>
      <h1 className="mb-5 text-2xl font-bold">Projects</h1>
      <ReelProjectGrid emptyMessage="No reels yet. Upload a video on the Create tab to make your first one." />
    </AppShell>
  );
}
