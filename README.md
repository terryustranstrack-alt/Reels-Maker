# Racik Reels

Turn one video into a ready-to-post vertical reel in one click: hook, captions, B-roll, effects, music and render.
Ships as a **Windows app** that renders on the user's PC. See [`context/decision-hybrid-windows-app.md`](context/decision-hybrid-windows-app.md).

- Product spec: [`context/prd-racik-reels-1-click-ai-reels-maker.md`](context/prd-racik-reels-1-click-ai-reels-maker.md)
- Design: [`context/ui-ux-mockup-racik-reels.html`](context/ui-ux-mockup-racik-reels.html) (open in a browser)

## Get the Windows installer

Every push to GitHub builds a new installer automatically:

1. Open the repository on GitHub → **Actions** tab → **Build Windows installer**.
2. Open the latest green run → under **Artifacts**, download **Racik-Reels-Windows-Installer**.
3. Unzip it and run `Racik-Reels-Setup-….exe`.

To build one by hand, click **Run workflow** on the same page.

## Develop on your computer

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Videos you use are saved in `.local-data/`, which is not committed to git.

To run it as a desktop app window instead:

```bash
npm run desktop:start
```

## What works now

- The full flow: upload → pick style → generating → review and edit → export.
- Videos are saved on the PC, so the preview still works after restarting the app.
- **Render MP4** makes a real 1080×1920, 30 fps MP4 on the PC with FFmpeg: 9:16 centre crop, trimmed to the reel length, hook and captions burned in.

**Still simulated:** transcription, AI hooks and captions (fixed sample Bahasa content), B-roll, music, credits, sign-in.

## Folders

| Folder | What's in it |
| --- | --- |
| `src/app/` | Pages, plus `api/local/` for saving videos and rendering on the PC |
| `src/components/` | Screen pieces, grouped by screen |
| `src/lib/local-files/`, `src/lib/local-render/` | Saving videos to disk; FFmpeg rendering and caption subtitles |
| `src/lib/demo-store/` | Project list and credits stored in the app (until the online service exists) |
| `desktop/` | Windows app window (Electron) and installer settings |
| `assets/fonts/` | Poppins fonts for burned-in captions (SIL Open Font License) |
| `supabase/migrations/` | Database for the online part (not applied yet) |
| `context/` | PRD, mockup and decisions |
