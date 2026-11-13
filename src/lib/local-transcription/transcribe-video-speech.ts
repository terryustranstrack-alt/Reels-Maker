import "server-only";

import { spawn } from "node:child_process";
import { cpus } from "node:os";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findFfmpegBinary } from "@/lib/local-render/find-ffmpeg-binary";
import type { WhisperTools } from "@/lib/local-transcription/find-whisper-tools";
import { parseWhisperJson } from "@/lib/local-transcription/parse-whisper-json";
import type { Transcript } from "@/lib/local-transcription/transcript-word-types";
import type { ReelLanguage } from "@/lib/reel-options/reel-style-options";

// Speech to text on this PC (PRD F2): FFmpeg pulls out the audio, Whisper writes words with timestamps.

export async function transcribeVideoSpeech(
  tools: WhisperTools,
  videoPath: string,
  language: ReelLanguage,
  workDir: string,
): Promise<Transcript> {
  const audioPath = path.join(workDir, "speech.wav");
  await extractSpeechAudio(videoPath, audioPath);
  await runWhisper(tools, audioPath, language, path.join(workDir, "transcript"));
  return parseWhisperJson(await readFile(path.join(workDir, "transcript.json"), "utf8"));
}

/** Whisper needs 16 kHz mono WAV audio. */
function extractSpeechAudio(videoPath: string, audioPath: string): Promise<void> {
  return runProgram(findFfmpegBinary(), ["-y", "-i", videoPath, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", audioPath]);
}

/** One word per line (-ml 1 -sow), JSON output (-oj) to `<outputBase>.json`. */
function runWhisper(tools: WhisperTools, audioPath: string, language: ReelLanguage, outputBase: string): Promise<void> {
  const threads = Math.min(8, Math.max(1, cpus().length - 1)); // leave one core for the app
  return runProgram(tools.programPath, [
    "-m", tools.modelPath,
    "-f", audioPath,
    "-l", language, // "id", "en" or "auto"
    "-t", String(threads),
    "-ml", "1", "-sow",
    "-oj", "-of", outputBase,
    "-np",
  ]);
}

/** Runs a program and rejects with the end of its error output if it fails. */
function runProgram(program: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { windowsHide: true });
    let log = "";
    child.stderr.on("data", (chunk: Buffer) => {
      log = (log + chunk.toString()).slice(-3000);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(program)} stopped with code ${code}: ${log.split("\n").slice(-5).join("\n")}`));
    });
  });
}
