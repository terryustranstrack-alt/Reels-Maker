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
- **What it does (1–2 sentences):** Turns one uploaded talking video into a ready-to-post 9:16 reel in one click — hook, animated captions, B-roll, effects, music and render.
- **Who uses it:** Indonesian UMKM owners, corporate marketing/HR teams, agencies and creators (see `context/prd-racik-reels-1-click-ai-reels-maker.md`).
- **Stack:** Next.js 16 (App Router) + Tailwind 4 · Supabase · Cloudflare R2 · Vercel · GitHub · render worker (separate container, planned)
- **Repo:** terryustranstrack-alt/Reels-Maker
- **Live URL:** not deployed yet
- **Important folders:**
  - `context/` — PRD and UI/UX mockup (read first)
  - `src/app/` — pages, one folder per screen
  - `src/components/` — screen pieces grouped by screen (`upload`, `style`, `generating`, `review`, `export`, `projects`, `layout`, `ui`)
  - `src/lib/reel-options/` — style presets, upload limits, pipeline steps, music list
  - `src/lib/demo-store/` — browser-only demo data store (to be replaced by Supabase)
  - `supabase/migrations/` — database changes

## Project status

<!-- Claude updates this at the end of each session -->

- **Last updated:** 2026-11-13
- **Recently done:**
  - Set up the Next.js app with the mockup's dark theme (Poppins, mint accent).
  - Built all mockup screens, working end to end in **demo mode**: Create/Upload (type, 500 MB and 3-min checks), Pick a style, Making your reel (live steps), Review (phone tabs + desktop editor with timeline), Export, Projects library.
  - Review edits work: choose/write hook, cold-open toggle, fix caption text, remove B-roll or switch layout, music, effects, change caption style (2 free changes).
  - Wrote the first database migration (`0001_initial_reels_schema.sql`) — not applied yet.
- **Pending / switched off:**
  - Demo mode only: data lives in the browser, generation is simulated with sample content.
  - Not built yet: sign-in, real upload to R2, render worker (transcription, Claude edit plan, FFmpeg render), Download MP4, SocialBooster send, billing, brand kit, notifications.
- **Needs action from me:**
  - Create a Supabase project and a Cloudflare R2 bucket when ready for the real backend; env var names are in `.env.example`.
  - Decide speech-to-text vendor (Whisper vs Deepgram) and where the render worker runs (Modal / Railway / VPS).
