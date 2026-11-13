# CLAUDE.md

Working rules for Claude on this project. Read this file fully before doing anything.

---

## 1. Start of every session

1. Check if the project has a `context/` folder. If it does, read every file in it and apply it before starting.
2. Read `CLAUDE.md`, `AGENTS.md` and `README.md` (whichever exist).
3. Check recent history with `git log --oneline -15` so you know what changed last.
4. Read the "Project status" section at the bottom of this file.
5. Give me a short summary of where the project stands, then ask what to work on (unless I already said).

## 2. About me

- I'm the owner, not a professional developer. I build these apps by vibe-coding with Claude.
- Explain changes in plain, non-technical language. Tell me **what changed** and **what I'll see** in the app.
- When I need to do something myself (add an env var, run a command, click something in Vercel/Supabase), give me numbered step-by-step instructions.

## 3. Language

- All **new** on-screen text (labels, buttons, messages) is in **English**.
- Existing Indonesian text stays as it is. Don't translate it unless I ask.

## 4. Code style

- Each function does **one job**. Split big functions into smaller ones.
- Add short, plain comments on the important parts of the code. No long essays.
- Follow the patterns and folder structure already used in the project. Don't reorganize files unless I ask.
- Use descriptive, organized file names.

## 5. Scope — do only what I ask

- Don't add features, pages, settings or libraries I didn't ask for.
- If you think something extra would help, **suggest it first** and wait for my yes.
- Don't refactor or "clean up" unrelated code while fixing something else.

## 6. Before saying "done"

- Run the type check and the linter (e.g. `npm run lint`, `npx tsc --noEmit`) and fix any errors you caused.
- Tell me exactly which files you changed.
- Mention any limitation or edge case you know about.

## 7. Safety

- Ask me before anything destructive: deleting files, dropping tables or columns, deleting data, force-pushing.
- Never put secrets, API keys or tokens in the code or in git. They belong in environment variables (Vercel / `.env.local`).
- When you add a new environment variable, tell me its name and where to add it.
- Database changes go in a **new** numbered migration file. Never edit an old migration that has already run.

## 8. Git

- Small commits with clear messages that say what changed (e.g. `Inbox: auto-scroll to latest message`).
- If you can't push (e.g. working from claude.ai without GitHub access), give me the changed files or a patch, and tell me how to apply it.

## 9. End of every session

Update the "Project status" section below: what was done, what's pending, and anything I need to do (like adding an env var).

---

## Project info

<!-- Fill this in for each app -->

- **App name:** Racik Reels (working name)
- **What it does (1–2 sentences):** Turns one uploaded talking video into a ready-to-post 9:16 reel in one click — hook, animated captions, B-roll, effects, music and render. Ships as a **Windows app** that renders on the user's PC, plus a small online service for sign-in, credits and AI (see `context/decision-hybrid-windows-app.md`).
- **Who uses it:** Indonesian UMKM owners, corporate marketing/HR teams, agencies and creators (see `context/prd-racik-reels-1-click-ai-reels-maker.md`).
- **Stack:** Next.js 16 (App Router) + Tailwind 4 inside an Electron Windows app · FFmpeg (ffmpeg-static) for local rendering · planned online part: Supabase + Claude API · GitHub Actions builds the installer
- **Repo:** terryustranstrack-alt/Reels-Maker
- **Live URL:** none (desktop app). Installer: GitHub → Actions → "Build Windows installer" → Artifacts
- **Important folders:**
  - `context/` — PRD, UI/UX mockup, decisions (read first)
  - `src/app/` — pages, one folder per screen; `src/app/api/local/` — save videos and render on the PC
  - `src/components/` — screen pieces grouped by screen
  - `src/lib/local-files/`, `src/lib/local-render/` — disk storage, FFmpeg render, caption subtitles
  - `src/lib/local-transcription/`, `src/lib/local-generation/` — Whisper speech-to-text, building the draft
  - `vendor/` — Whisper program + model (downloaded, not in git)
  - `src/lib/demo-store/` — project list and credits kept in the app (to move online later)
  - `desktop/` — Electron window and installer settings
  - `supabase/migrations/` — database changes for the online part

## Project status

<!-- Claude updates this at the end of each session -->

- **Last updated:** 2026-11-13
- **Recently done:**
  - Built all mockup screens (upload, style, generating, review on phone and desktop, export, projects) with the mockup's dark theme.
  - Decided on the hybrid Windows app (`context/decision-hybrid-windows-app.md`).
  - Videos are saved on the PC's disk; the preview survives restarts.
  - **Render MP4 works for real**: FFmpeg on the PC makes a 1080×1920, 30 fps MP4 with 9:16 centre crop, the hook and captions burned in.
  - Electron Windows app wrapper, plus a GitHub Actions workflow that builds the `.exe` installer.
  - Tested the packaged app end to end on Linux, including a real render.
  - First Windows installer build on GitHub Actions succeeded (about 174 MB); tested by the owner on Windows, render with captions works.
  - **Real transcription**: Whisper ("small" model) runs on the PC and turns the video's speech into captions with real timings. "Making your reel" shows real progress; failures show a message and refund the credit.
  - The installer build downloads the newest whisper.cpp Windows release (only whisper-cli.exe + DLLs) and checks it transcribes a sample before building. First passing build: 22-word English sample in 9.1 s; installer ~360 MB.
- **Pending / switched off:**
  - Simple rules instead of AI (until the online Claude service): hook options are the speaker's own sentences, highlight = longest meaningful word, post caption = first two sentences.
  - Not built: silence/filler cutting, face tracking, B-roll, music, zooms, credits, sign-in.
  - Real Whisper has only been run on GitHub's Windows build machine, not yet on the owner's PC with Bahasa speech.
  - Fixed: the hidden local server could stay running after closing the app, which blocked reinstalling ("Racik Reels cannot be closed"). It now always stops with the app, even after a crash.
  - Project list and credits live in the app's local storage (`src/lib/demo-store`).
  - SocialBooster send is disabled; Brand kit and Account pages are placeholders.
  - The installer is unsigned, so Windows SmartScreen warns "unknown publisher".
- **Needs action from me:**
  - Download the new installer (about 360 MB now, includes Whisper) and try it with a real Bahasa talking video.
  - Before public launch: buy a code-signing certificate.
  - For the online part: create a Supabase project and an Anthropic API key (names in `.env.example`).
