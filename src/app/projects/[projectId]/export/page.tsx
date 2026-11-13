import { Suspense } from "react";
import { ExportView } from "@/components/export/export-view";

// Screen 05 — Export.
// The reel ID is read from the URL in the browser, because projects live in the browser in demo mode.
export default function ExportPage() {
  return (
    <div className="mx-auto max-w-xl px-5">
      <Suspense>
      <ExportView />
    </Suspense>
    </div>
  );
}
