import "server-only";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SETTINGS_DIR, ensureDataFolders } from "@/lib/local-files/local-data-paths";

// Address of the online AI service and the alpha access code, saved on this PC
// (in the app's data folder, not in the browser storage and not in git).

export type AiServiceSettings = { serviceUrl: string; accessCode: string };

const SETTINGS_FILE = path.join(SETTINGS_DIR, "ai-service.json");

export async function readAiServiceSettings(): Promise<AiServiceSettings | null> {
  try {
    const saved = JSON.parse(await readFile(SETTINGS_FILE, "utf8")) as Partial<AiServiceSettings>;
    return saved.serviceUrl && saved.accessCode ? { serviceUrl: saved.serviceUrl, accessCode: saved.accessCode } : null;
  } catch {
    return null; // not set up yet
  }
}

export async function saveAiServiceSettings(settings: AiServiceSettings) {
  await ensureDataFolders();
  await writeFile(SETTINGS_FILE, JSON.stringify(settings), "utf8");
}

/** "racik-reels.vercel.app/" → "https://racik-reels.vercel.app". Returns null if it isn't a web address. */
export function normalizeServiceUrl(input: string): string | null {
  const withScheme = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
  try {
    const url = new URL(withScheme);
    return url.origin;
  } catch {
    return null;
  }
}
