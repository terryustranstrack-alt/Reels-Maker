# Decision: hybrid Windows app (2026-11-13)

Racik Reels ships as an **installed Windows app** instead of the web app described in the PRD.

**On the user's PC (offline):**
- the app screens (same Next.js app, running on a small local server inside the app)
- saving uploaded videos
- rendering the final MP4 with FFmpeg
- later: transcription with Whisper, face tracking with MediaPipe, music library

**Online (small service, still to build):**
- sign-in, credits and payments (Supabase + Midtrans/Xendit)
- AI writing with the Claude API: hooks, best moment, B-roll keywords, post caption
- stock B-roll downloads (Pexels/Pixabay)
- SocialBooster draft handoff

**Why:** no big video uploads, videos stay private on the user's PC, no render server to pay for.

**Trade-offs accepted:**
- no phone users
- an installer to download (about 150–200 MB now)
- speed depends on the user's PC
- a code-signing certificate is needed before public launch (about USD 200–400 a year), otherwise Windows shows an "unknown publisher" warning

**PRD parts this changes:** "Works fully on a phone browser" (goal 4) and the mobile requirements are dropped for v1. The server render worker (Modal / Railway / VPS) is no longer needed.
