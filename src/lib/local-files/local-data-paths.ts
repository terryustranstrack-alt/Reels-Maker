import "server-only";

import { mkdir } from "node:fs/promises";
import path from "node:path";

// Where the desktop app keeps videos on the user's PC.
// The Windows app sets RACIK_DATA_DIR to its own app-data folder; during development it is ./.local-data.

const DATA_DIR = process.env.RACIK_DATA_DIR ?? path.join(process.cwd(), ".local-data");

export const SOURCE_VIDEOS_DIR = path.join(DATA_DIR, "source-videos");
export const RENDERED_REELS_DIR = path.join(DATA_DIR, "rendered-reels");
export const RENDER_WORK_DIR = path.join(DATA_DIR, "render-work");
export const GENERATION_RESULTS_DIR = path.join(DATA_DIR, "generation-results");

const FILE_ID_PATTERN = /^[0-9a-f-]{36}(\.[a-z0-9]{2,5})?$/;

/** File ids come from the browser, so only accept our own UUID-style names (blocks "../" tricks). */
export function isSafeFileId(fileId: string): boolean {
  return FILE_ID_PATTERN.test(fileId);
}

export async function ensureDataFolders() {
  await Promise.all([SOURCE_VIDEOS_DIR, RENDERED_REELS_DIR, RENDER_WORK_DIR, GENERATION_RESULTS_DIR].map((dir) => mkdir(dir, { recursive: true })));
}
