# Racik Reels

Turn one uploaded video into a ready-to-post vertical reel in one click: hook, captions, B-roll, effects, music and render.
Full product spec: [`context/prd-racik-reels-1-click-ai-reels-maker.md`](context/prd-racik-reels-1-click-ai-reels-maker.md).
Design: [`context/ui-ux-mockup-racik-reels.html`](context/ui-ux-mockup-racik-reels.html) (open in a browser).

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Current state: demo mode

The full user flow works in the browser (upload → pick style → generating → review and edit → export),
but nothing is sent to a server yet:

- Projects and credits are saved in the browser (localStorage). You start with 12 demo credits.
- Generation is simulated (about 20 seconds) and the draft uses fixed sample Bahasa content.
- The preview plays your own uploaded video with the hook and captions on top, as long as you stay in the same tab.
- Download MP4 and Send to SocialBooster are shown but disabled until the render worker and SocialBooster API are connected.

## Folders

| Folder | What's in it |
| --- | --- |
| `src/app/` | Pages: `/` (create), `/create/style`, `/projects`, `/projects/[id]/generating`, `/review`, `/export` |
| `src/components/` | Screen pieces, grouped by screen (`upload`, `style`, `generating`, `review`, `export`, `projects`, `layout`, `ui`) |
| `src/lib/reel-options/` | Style presets, upload limits, pipeline steps, music list |
| `src/lib/demo-store/` | Browser-only data store and sample draft (replaced by Supabase later) |
| `supabase/migrations/` | Database changes (not applied yet) |
| `context/` | PRD and UI/UX mockup |
