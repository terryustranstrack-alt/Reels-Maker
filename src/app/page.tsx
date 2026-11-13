import { AppShell } from "@/components/layout/app-shell";
import { RecentReelsSection } from "@/components/projects/reel-project-grid";
import { VideoUploadCard } from "@/components/upload/video-upload-card";

// Screen 01 — Create / Upload (home page).
export default function CreateReelPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-xl md:max-w-none">
        <div className="md:grid md:grid-cols-2 md:items-center md:gap-10">
          <div>
            <h1 className="text-[28px] font-bold leading-tight md:text-4xl">Turn one video into a ready reel</h1>
            <p className="mt-2 text-ink-muted md:text-lg">
              Upload a talking video. We add the hook, captions, B-roll, effects and music for you.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <VideoUploadCard />
          </div>
        </div>
        <RecentReelsSection />
      </div>
    </AppShell>
  );
}
