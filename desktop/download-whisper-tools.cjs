// Downloads the Whisper speech-recognition program (Windows) and its "small" model into ./vendor.
// Used by the installer build on GitHub and by `npm run desktop:download-whisper` on a Windows PC.
// vendor/ is not committed to git (large files).

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");

const MODEL_FILE = "ggml-small-q5_1.bin"; // must match src/lib/local-transcription/find-whisper-tools.ts
const PROGRAM_ZIP_NAME = "whisper-bin-x64.zip"; // official Windows (CPU) build
const RELEASES_API = "https://api.github.com/repos/ggml-org/whisper.cpp/releases?per_page=30";
const MODEL_URL = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${MODEL_FILE}`;

const vendorDir = path.join(__dirname, "..", "vendor");
const programDir = path.join(vendorDir, "whisper");
const modelDir = path.join(vendorDir, "whisper-models");
const tempDir = path.join(vendorDir, "tmp");

/** Not every whisper.cpp release includes the Windows program, so use the newest one that does. */
async function findWindowsProgramZipUrl() {
  const response = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`Couldn't list whisper.cpp releases (${response.status})`);
  for (const release of await response.json()) {
    const asset = (release.assets ?? []).find((item) => item.name === PROGRAM_ZIP_NAME);
    if (!release.draft && !release.prerelease && asset) {
      console.log(`Using whisper.cpp ${release.tag_name}`);
      return asset.browser_download_url;
    }
  }
  throw new Error(`No whisper.cpp release has ${PROGRAM_ZIP_NAME}.`);
}

async function downloadFile(url, targetPath) {
  console.log(`Downloading ${url}`);
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) throw new Error(`Download failed (${response.status}): ${url}`);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(targetPath));
}

async function ensureModel() {
  const modelPath = path.join(modelDir, MODEL_FILE);
  if (fs.existsSync(modelPath)) return console.log("Model already downloaded.");
  await downloadFile(MODEL_URL, `${modelPath}.part`);
  fs.renameSync(`${modelPath}.part`, modelPath); // only a complete file gets the real name
}

/** The official Windows zip holds whisper-cli.exe plus the DLL files it needs; copy that whole folder. */
async function ensureWindowsProgram() {
  if (fs.existsSync(path.join(programDir, "whisper-cli.exe"))) return console.log("Whisper program already downloaded.");
  const zipPath = path.join(tempDir, "whisper-bin-x64.zip");
  const extractDir = path.join(tempDir, "whisper-extract");
  await downloadFile(await findWindowsProgramZipUrl(), zipPath);
  fs.mkdirSync(extractDir, { recursive: true });
  execFileSync("tar", ["-xf", zipPath, "-C", extractDir]); // Windows 10+ tar can open zip files

  const programPath = findFile(extractDir, "whisper-cli.exe");
  if (!programPath) throw new Error("whisper-cli.exe was not found in the downloaded zip.");
  fs.mkdirSync(programDir, { recursive: true });
  fs.cpSync(path.dirname(programPath), programDir, { recursive: true });
  fs.rmSync(tempDir, { recursive: true, force: true });
}

function findFile(folder, fileName) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const fullPath = path.join(folder, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === fileName) return fullPath;
    if (entry.isDirectory()) {
      const found = findFile(fullPath, fileName);
      if (found) return found;
    }
  }
  return null;
}

async function main() {
  await ensureModel();
  if (process.platform === "win32") await ensureWindowsProgram();
  else console.log("Not on Windows: put a whisper-cli build in vendor/whisper/ yourself (the Windows installer gets it automatically).");
  console.log("Whisper tools ready in", vendorDir);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
