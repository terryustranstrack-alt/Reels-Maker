"use client";

import { useEffect, useState } from "react";

/** Current time in ms, refreshed every `intervalMs` — used for live progress displays. */
export function useCurrentTime(intervalMs = 500): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
