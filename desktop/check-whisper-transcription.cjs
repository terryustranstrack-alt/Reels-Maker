// Quick check run by the installer build: transcribes a short English sample with the downloaded
// Whisper program, using the same settings as the app, and fails the build if no words come back.

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const SAMPLE_URL = "https://raw.githubusercontent.com/ggml-org/whisper.cpp/v1.9.5/samples/jfk.wav";
const vendorDir = path.join(__dirname, "..", "vendor");
const programName = process.platform === "win32" ? "whisper-cli.exe" : "whisper-cli";
const programPath = path.join(vendorDir, "whisper", programName);
const modelPath = path.join(vendorDir, "whisper-models", "ggml-small-q5_1.bin");
const workDir = path.join(vendorDir, "check");

async function main() {
  fs.mkdirSync(workDir, { recursive: true });
  const samplePath = path.join(workDir, "sample.wav");
  const response = await fetch(SAMPLE_URL);
  if (!response.ok) throw new Error(`Sample download failed (${response.status})`);
  fs.writeFileSync(samplePath, Buffer.from(await response.arrayBuffer()));

  const started = Date.now();
  // Same flags as src/lib/local-transcription/transcribe-video-speech.ts
  execFileSync(programPath, ["-m", modelPath, "-f", samplePath, "-l", "en", "-t", "4", "-ml", "1", "-sow", "-oj", "-of", path.join(workDir, "transcript"), "-np"], {
    stdio: "inherit",
  });
  const result = JSON.parse(fs.readFileSync(path.join(workDir, "transcript.json"), "utf8"));
  const words = (result.transcription ?? []).map((segment) => segment.text.trim()).filter(Boolean);

  console.log(`Transcribed ${words.length} words in ${((Date.now() - started) / 1000).toFixed(1)} s:`);
  console.log(words.join(" "));
  fs.rmSync(workDir, { recursive: true, force: true });
  if (words.length < 5) throw new Error("Whisper returned too few words.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
