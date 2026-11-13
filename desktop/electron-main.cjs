// Racik Reels — Windows desktop app.
// Starts the app's small local server on this PC, then opens it in an app window.
// Videos are saved and rendered on this PC; nothing is uploaded.

const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

// A fixed address keeps the saved project list between app starts (it is stored per address).
const LOCAL_PORT = 47831;
const LOCAL_URL = `http://127.0.0.1:${LOCAL_PORT}`;

let serverProcess = null;
let mainWindow = null;

// ---------- Where the app's files are ----------

/** Folder of the bundled server: inside the installed app, or the project build while developing. */
function serverFolder() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "server")
    : path.join(__dirname, "..", ".next", "standalone");
}

function ffmpegPath() {
  const fileName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  return path.join(serverFolder(), "node_modules", "ffmpeg-static", fileName);
}

// ---------- Local server ----------

/** Runs the bundled Next.js server with Electron's built-in Node.js. */
function startLocalServer() {
  const folder = serverFolder();
  serverProcess = spawn(process.execPath, [path.join(folder, "server.js")], {
    cwd: folder,
    windowsHide: true,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(LOCAL_PORT),
      HOSTNAME: "127.0.0.1", // only this PC can reach it
      RACIK_DATA_DIR: path.join(app.getPath("userData"), "reels-data"),
      RACIK_FFMPEG_PATH: ffmpegPath(),
      RACIK_FONTS_DIR: path.join(folder, "assets", "fonts"),
    },
  });
  serverProcess.stdout.on("data", (chunk) => console.log(`[server] ${chunk}`));
  serverProcess.stderr.on("data", (chunk) => console.error(`[server] ${chunk}`));
  serverProcess.on("exit", (code) => {
    if (code && !app.isQuitting) showStartupError(`The local server stopped (code ${code}).`);
  });
}

/** Resolves once the local server answers, or rejects after ~30 seconds. */
function waitForServer(attemptsLeft = 60) {
  return new Promise((resolve, reject) => {
    const tryOnce = (left) => {
      http
        .get(LOCAL_URL, (response) => {
          response.resume();
          resolve();
        })
        .on("error", () => {
          if (left <= 0) reject(new Error("The app didn't start in time."));
          else setTimeout(() => tryOnce(left - 1), 500);
        });
    };
    tryOnce(attemptsLeft);
  });
}

// ---------- Window ----------

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 380,
    minHeight: 640,
    backgroundColor: "#191919",
    title: "Racik Reels",
    autoHideMenuBar: true,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });

  // Links to other websites open in the normal browser, not inside the app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(LOCAL_URL)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  return mainWindow;
}

function showStartupError(message) {
  dialog.showErrorBox("Racik Reels couldn't start", `${message}\n\nPlease close the app and open it again.`);
}

// ---------- App lifecycle ----------

// Only one copy of the app at a time (they would share the same local address).
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    startLocalServer();
    const window = createMainWindow();
    try {
      await waitForServer();
      await window.loadURL(LOCAL_URL);
    } catch (error) {
      showStartupError(error.message);
      app.quit();
    }
  });

  app.on("before-quit", () => {
    app.isQuitting = true;
    if (serverProcess) serverProcess.kill();
  });
  app.on("window-all-closed", () => app.quit());
}
