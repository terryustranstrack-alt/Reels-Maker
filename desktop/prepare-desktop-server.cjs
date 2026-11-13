// Runs after `next build`: completes the standalone server folder so the desktop app can run it.
// Next.js leaves the browser files (.next/static) and public/ out of the standalone folder.

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");
const standaloneDir = path.join(projectRoot, ".next", "standalone");

function copyFolder(from, to) {
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, to, { recursive: true });
}

if (!fs.existsSync(path.join(standaloneDir, "server.js"))) {
  console.error("No standalone build found. Run `next build` first.");
  process.exit(1);
}

copyFolder(path.join(projectRoot, ".next", "static"), path.join(standaloneDir, ".next", "static"));
copyFolder(path.join(projectRoot, "public"), path.join(standaloneDir, "public"));
copyFolder(path.join(projectRoot, "assets", "fonts"), path.join(standaloneDir, "assets", "fonts"));

// Safety net: never ship local test videos.
fs.rmSync(path.join(standaloneDir, ".local-data"), { recursive: true, force: true });

console.log("Desktop server folder ready:", standaloneDir);
