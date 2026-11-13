// Starts the app's local server, and stops it as soon as the Racik Reels window process is gone.
// Without this, a crashed or force-closed app could leave the server running in the background,
// which blocks the installer ("Racik Reels cannot be closed").
// Copied next to server.js by prepare-desktop-server.cjs.

const PARENT_CHECK_MS = 2000;
const parentPid = Number(process.env.RACIK_PARENT_PID);

/** True while the app window process still exists (signal 0 only checks, it doesn't stop anything). */
function parentIsRunning() {
  try {
    process.kill(parentPid, 0);
    return true;
  } catch {
    return false;
  }
}

if (parentPid) {
  setInterval(() => {
    if (!parentIsRunning()) process.exit(0);
  }, PARENT_CHECK_MS).unref();
}

require("./server.js");
