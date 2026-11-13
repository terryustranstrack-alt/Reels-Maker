import { Suspense } from "react";
import { ReviewEditor } from "@/components/review/review-editor";

// Screen 04 — Review and quick edit (phone and desktop).
// The reel ID is read from the URL in the browser, because projects live in the browser in demo mode.
export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewEditor />
    </Suspense>
  );
}
