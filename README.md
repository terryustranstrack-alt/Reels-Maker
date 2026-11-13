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

Speech recognition needs Whisper in `vendor/`. On a Windows PC run `npm run desktop:download-whisper` once (about 190 MB). Without it, the app still works but uses sample captions and says so.

To run it as a desktop app window instead:

```bash
npm run desktop:start
```

## What works now

- The full flow: upload → pick style → generating → review and edit → export.
- Videos are saved on the PC, so the preview still works after restarting the app.
- **Real transcription on the PC** with Whisper ("small" model, Bahasa Indonesia and English). Captions are the speaker's real words with real timings.
- The reel ends at a sentence end near the chosen length.
- **Render MP4** makes a real 1080×1920, 30 fps MP4 on the PC with FFmpeg: 9:16 centre crop, trimmed to the reel length, hook and captions burned in.

**Simple rules for now (Claude AI comes with the online service):** hook options are the speaker's own sentences, keyword highlight is the longest meaningful word, post caption is the first two sentences.
**Not built yet:** silence and filler cutting, face tracking, B-roll, music, zooms, credits, sign-in.

## Folders

| Folder | What's in it |
| --- | --- |
| `src/app/` | Pages, plus `api/local/` for saving videos and rendering on the PC |
| `src/components/` | Screen pieces, grouped by screen |
| `src/lib/local-files/`, `src/lib/local-render/` | Saving videos to disk; FFmpeg rendering and caption subtitles |
| `src/lib/local-transcription/`, `src/lib/local-generation/` | Whisper speech-to-text; building the draft from the transcript |
| `src/lib/demo-store/` | Project list and credits stored in the app (until the online service exists) |
| `desktop/` | Windows app window (Electron), installer settings, Whisper download and check scripts |
| `vendor/` | Whisper program and model, downloaded (not in git) |
| `assets/fonts/` | Poppins fonts for burned-in captions (SIL Open Font License) |
| `supabase/migrations/` | Database for the online part (not applied yet) |
| `context/` | PRD, mockup and decisions |
