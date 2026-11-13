# PRD — Racik Reels: 1-Click AI Reels Maker

Nov 13, 2026 · @Terry

## Overview

Racik Reels turns one uploaded video into a ready-to-post vertical reel in one click: captions, hook, effects, stock B-roll, music and render, with no editing skills needed.

- **Owner:** Racik Digital. Sold as a standalone SaaS product, integrated with SocialBooster for scheduling.
- **Working name:** "Racik Reels" (placeholder; final name open).
- **Platform:** responsive web app, desktop and mobile browser. Rendering runs on the server.
- **Market:** Indonesian organizations first (UMKM, agencies, corporate marketing and HR teams), Bahasa Indonesia and English.

**Problem.** Short video drives reach on Instagram, TikTok and YouTube Shorts, but editing a reel takes 30–90 minutes in CapCut or an agency fee per video. Most small teams record raw talking videos and never publish them, or publish them unedited with weak hooks and no captions.

**Solution.** Upload a raw video, pick a style, press Generate. The AI transcribes, writes a hook, adds animated captions, cuts silences, inserts matching stock clips, adds zooms and music, then renders a 9:16 MP4. Users can tweak text and swap clips after the draft, but the default path needs zero editing.

## Goals, non-goals and success metrics

The MVP succeeds if a first-time user gets a publishable reel in under 5 minutes and enough of them pay to cover compute costs.

**Goals**

1. One-click generation: upload to finished reel with no required editing.
2. Quality good enough to post as-is for at least 70% of generated reels.
3. Profitable per reel: credit price covers transcription, AI, stock and render costs with at least 60% gross margin.
4. Works fully on a phone browser.
5. One-click handoff to SocialBooster for scheduling.

**Non-goals for v1**

- A full multi-track timeline editor like CapCut or Premiere.
- Long video to many clips (Opus Clip style). Candidate for v2.
- AI avatars, voice cloning or AI-generated footage.
- Native iOS or Android apps.
- Direct publishing to social platforms (SocialBooster handles that).

**Success metrics (first 6 months after launch)**

| Metric | Target |
| --- | --- |
| Time from upload to rendered reel (p50) | < 3 min for a 60 s input |
| Reels exported without manual edits | ≥ 70% |
| Free-to-paid conversion | ≥ 5% |
| Paid month-2 retention | ≥ 60% |
| Gross margin per credit | ≥ 60% |
| Render failure rate | < 2% |

## Target users and personas

The primary buyer is a small team that records video but has no editor; agencies are the high-volume secondary segment.

| Persona | Who | Main need | Likely plan |
| --- | --- | --- | --- |
| UMKM owner | Fashion or F&B shop owner, posts from a phone | Fast reels of products and promos, Bahasa captions | Starter |
| Corporate marketer | Marketing or HR staff at a mid-size company | On-brand reels from talks, testimonials, events | Pro |
| Agency / freelancer | Social media manager handling 5–20 client accounts | Volume, multiple brand kits, SocialBooster scheduling | Agency |
| Creator / coach | Educator or speaker selling courses | Hooks and captions that keep viewers watching | Starter or Pro |

Racik Digital's own client work is the first test bed: every client reel Racik produces should go through the product before public launch.

## Core user flow

The happy path is four screens and one button press; editing is optional and happens after the draft exists.

1. **Upload.** Drag, drop or pick from phone gallery. MP4, MOV, WEBM, up to 3 minutes and 500 MB. Upload resumes if the connection drops.
2. **Choose style.** Pick a style preset (e.g. Bold Hype, Clean Corporate, Soft Lifestyle), language, target length (15, 30, 60, 90 s) and brand kit. Smart defaults are pre-selected, so the user can skip this.
3. **Generate.** One button. A progress screen shows live steps:
   1. Transcribe speech and detect language.
   2. Remove silences and filler words.
   3. Pick the strongest moment and trim to target length.
   4. Write the hook headline and place it in the first 3 seconds.
   5. Reframe to 9:16 with face tracking.
   6. Add animated captions with keyword highlights.
   7. Insert stock B-roll matched to keywords.
   8. Add zoom punch-ins, transitions, sound effects and music.
   9. Render a preview.
4. **Review.** Watch the preview. Optional quick edits: change hook text, pick from 3 alternative hooks, fix caption words, swap or remove a B-roll clip, change music, switch style.
5. **Export.** Render final MP4 (1080×1920). Download, copy caption text, or send to SocialBooster.

The user gets a notification (in app and email) when generation finishes, so they can leave the page.

## Functional requirements

P0 ships in the MVP, P1 within 2 months after, P2 is backlog.

| ID | Module | Requirement | Priority |
| --- | --- | --- | --- |
| F1 | Upload | Upload one video (MP4/MOV/WEBM, ≤ 3 min, ≤ 500 MB), resumable, from desktop or phone | P0 |
| F2 | Transcription | Speech-to-text with word timestamps, Bahasa Indonesia and English, auto language detect | P0 |
| F3 | Cleanup | Remove silences > 0.5 s and filler words ("eee", "umm", "jadi…"), toggle on/off | P0 |
| F4 | Trim | AI selects the strongest segment to fit target length; keeps sentences whole | P0 |
| F5 | Hook | AI writes hook headline shown in first 3 s; 3 alternatives to choose from; hook style presets (question, bold claim, number, curiosity) | P0 |
| F6 | Hook | Option to move the strongest moment to the start (cold open) | P1 |
| F7 | Reframe | Auto crop to 9:16 with face/subject tracking; blurred-background fallback | P0 |
| F8 | Captions | Animated word-by-word captions; ≥ 6 style presets; active-word and keyword highlight; emoji toggle | P0 |
| F9 | Captions | Edit caption text and timing inline; font, size, position | P0 |
| F10 | B-roll | Auto insert 2–5 stock clips matched to transcript keywords (Pexels/Pixabay); picture-in-picture or full-screen | P0 |
| F11 | B-roll | Swap, remove or search a replacement clip; upload own B-roll | P1 |
| F12 | Effects | Auto zoom punch-ins on emphasis, transitions between cuts, color filter per style | P0 |
| F13 | Audio | Royalty-free music library by mood; auto-ducking under speech; sound effects on hook and transitions | P0 |
| F14 | Audio | Noise reduction and loudness normalization | P1 |
| F15 | Brand kit | Logo watermark, brand fonts and colors, intro/outro card | P1 |
| F16 | Render | Final MP4 1080×1920, 30 fps; 720p on free plan with watermark | P0 |
| F17 | Export | Download, copy AI-written post caption + hashtags, send to SocialBooster | P0 |
| F18 | Projects | Library of past reels with status (Processing, Ready, Exported); regenerate with another style | P0 |
| F19 | Account | Sign up with Google or email; workspaces with team members | P0 (single user) / P1 (teams) |
| F20 | Billing | Credit balance, plans, top-ups via Midtrans or Xendit (QRIS, e-wallet, VA, card) | P0 |
| F21 | Templates | Save a custom style as a reusable template | P2 |
| F22 | Multi-clip | Long video to multiple reels | P2 |
| F23 | Languages | More caption languages and auto-translate captions | P2 |

## Non-functional requirements

| Area | Requirement |
| --- | --- |
| Speed | p50 generation < 3 min for 60 s input; preview playable before final render |
| Reliability | Jobs survive restarts and retry failed steps; render failure < 2% |
| Scale | Queue-based processing; 50 concurrent jobs at launch, scale horizontally |
| Mobile | All flows usable at 360 px width; upload from phone gallery; touch-friendly editor |
| Storage | Source videos deleted after 30 days, rendered reels kept 90 days (longer on paid plans) |
| Privacy | Videos private by default; signed URLs; compliance with Indonesia's PDP Law (UU 27/2022) |
| Licensing | Only royalty-free stock and music with commercial-use licenses; store license source per asset |
| Cost control | Hard credit check before a job starts; per-job cost logging |
| Localization | UI in Bahasa Indonesia and English |

## SocialBooster integration

Racik Reels stays a separate product; SocialBooster receives finished reels through an API, so each can be sold alone or as a bundle.

- **Send to SocialBooster:** after export, one button pushes the MP4, AI-written post caption and hashtags into SocialBooster as a draft post, ready to schedule.
- **Account linking:** user connects a SocialBooster workspace once with OAuth or an API key; linked status shows in Settings.
- **Shared brand kit (P1):** logo, fonts and colors sync between both products.
- **Bundle plan (P2):** "Reels + Scheduler" plan with combined billing.
- **API contract:** `POST /api/posts/draft` on SocialBooster with media URL, caption, hashtags, target platforms and suggested publish time.

Open point: SocialBooster is currently branded "by TransTRACK". Before selling the bundle, agree with TransTRACK on ownership, licensing or a white-label Racik version.

## Pricing and credit model

Proposed: monthly plans that include credits, where 1 credit = 1 generated reel up to 60 s (90 s reels cost 2 credits). Prices are a starting proposal to validate with real cost data.

| Plan | Price / month (IDR) | Credits | Output | Extras |
| --- | --- | --- | --- | --- |
| Free | 0 | 3 | 720p, watermark | Basic styles |
| Starter | 99,000 | 20 | 1080p, no watermark | All styles, music library |
| Pro | 249,000 | 60 | 1080p | Brand kit, B-roll swap, SocialBooster |
| Agency | 699,000 | 200 | 1080p | 10 brand kits, 5 team seats, priority queue |

- **Top-up:** extra credits at about Rp 7,000 each; unused plan credits expire monthly, top-up credits last 12 months.
- **Regenerate:** changing style after generation is free up to 2 times per reel.
- **Cost guardrail:** estimated variable cost per 60 s reel (transcription, AI text, stock API, render compute) is approximately Rp 1,000–2,500. This must be measured in the beta before prices are final.

## Technical architecture

The web app only uploads, shows progress and plays previews; every heavy step runs in queued workers, so phones stay fast and failed steps can retry.

&#91;embedded content: system architecture · web app, API, queue, 4-step worker\]

Vercel functions cannot run long FFmpeg renders, so the worker runs as a separate container service.

| Layer | Suggested choice | Why |
| --- | --- | --- |
| Frontend | Next.js + Tailwind, hosted on Vercel | Same stack as SocialBooster; responsive by default |
| Auth + database | Supabase (Auth + Postgres) | Fast to build with AI coding tools; row-level security |
| Storage | Cloudflare R2 | No egress fees for video downloads |
| Queue | Inngest or BullMQ on Redis | Step retries and progress events |
| Worker | Docker container on Modal, Railway or a VPS, with FFmpeg | Long-running renders, autoscaling |
| Caption and effect rendering | Remotion (React video) or FFmpeg ASS subtitles | Animated caption presets as code; check Remotion's company license |
| Speech-to-text | Whisper API or Deepgram | Word timestamps, good Bahasa support |
| AI edit plan | Claude API | Hook writing, segment choice, B-roll keywords, post caption |
| Face tracking | MediaPipe | 9:16 reframe |
| Stock media | Pexels API, Pixabay API | Free commercial-use footage |
| Payments | Midtrans or Xendit | QRIS, e-wallet, virtual account, card |

## Release plan, risks and open questions

Ship in three phases, each gated on real usage data before spending more.

1. **Phase 1: Internal alpha (weeks 1–4).** P0 pipeline end to end, one caption style, one hook style. Racik Digital uses it on its own and client reels. Gate: 20 reels exported, cost per reel measured.
2. **Phase 2: Closed beta (weeks 5–8).** All P0 features, credits and payments, mobile polish, SocialBooster draft handoff. 30–50 invited UMKM and agency users. Gate: ≥ 70% exported without edits, ≥ 5 paying users.
3. **Phase 3: Public launch (weeks 9–12).** P1 features (brand kit, B-roll swap, audio cleanup, teams), landing page, launch content. Gate: margin ≥ 60% at real volume.

**Risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Render cost higher than credit price | Loss on every reel | Measure in alpha; cap length; 720p on free plan |
| AI picks a weak hook or wrong segment | Users stop trusting 1-click | 3 hook alternatives; style regenerate; collect thumbs up/down |
| Bahasa transcription errors (slang, mixed English) | Caption fixes, bad first impression | Test Whisper vs Deepgram on real Indonesian clips; easy inline caption edit |
| Stock clips feel generic or off-topic | Reels look cheap | Keyword relevance check; B-roll swap; allow own B-roll |
| Music or stock licensing issue | Takedowns, legal exposure | Only commercial-use libraries; log license per asset |
| Competitors (CapCut, Submagic) add the same | Weak differentiation | Bahasa-first quality, local payments, SocialBooster bundle, agency plan |

**Open questions**

- [ ] Final product name and domain.
- [ ] Ownership and licensing terms for the SocialBooster integration with TransTRACK.
- [ ] Speech-to-text vendor after the Bahasa accuracy test.
- [ ] Build team: Terry with AI coding tools only, or a freelance developer for the render worker?
- [ ] Free plan size: 3 reels a month, or a one-time trial?
