"use client";

import { useParams } from "next/navigation";

/** The `[projectId]` part of the current URL. */
export function useProjectIdParam(): string {
  const { projectId } = useParams<{ projectId: string }>();
  return projectId;
}
