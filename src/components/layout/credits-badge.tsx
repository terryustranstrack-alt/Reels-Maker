"use client";

import { CreditIcon } from "@/components/ui/app-icons";
import { useDemoState } from "@/lib/demo-store/demo-project-store";

// Shows the user's remaining credits in the header.
export function CreditsBadge() {
  const { credits } = useDemoState();
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-sm font-semibold">
      <CreditIcon size={18} className="text-brand" />
      {credits} credits
    </span>
  );
}
