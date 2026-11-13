import { Suspense } from "react";
import { GenerationProgressView } from "@/components/generating/generation-progress-view";

// Screen 03 — Making your reel.
// The reel ID is read from the URL in the browser, because projects live in the browser in demo mode.
export default function GeneratingPage() {
  return (
    <div className="mx-auto max-w-xl px-5">
      <Suspense>
      <GenerationProgressView />
    </Suspense>
    </div>
  );
}
