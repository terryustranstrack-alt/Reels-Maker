import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

// Where the Whisper speech-recognition program and its model file are.
// The Windows app sets RACIK_WHISPER_PATH / RACIK_WHISPER_MODEL; during development they live in ./vendor
// (download them with `npm run desktop:download-whisper`).

export const WHISPER_MODEL_FILE = "ggml-small-q5_1.bin"; // "small" model: good Bahasa Indonesia, ~190 MB

export type WhisperTools = { programPath: string; modelPath: string };

export function findWhisperTools(): WhisperTools | null {
  const programName = process.platform === "win32" ? "whisper-cli.exe" : "whisper-cli";
  const programPath = process.env.RACIK_WHISPER_PATH || path.join(process.cwd(), "vendor", "whisper", programName);
  const modelPath =
    process.env.RACIK_WHISPER_MODEL || path.join(process.cwd(), "vendor", "whisper-models", WHISPER_MODEL_FILE);
  return existsSync(programPath) && existsSync(modelPath) ? { programPath, modelPath } : null;
}
