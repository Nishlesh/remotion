# FocusStack Remotion engine

Reusable **1080×1920 @ 30fps** engine for faceless vertical micro-documentaries (25–50 seconds). Locked voiceover is the source of truth. One spoken line becomes one Remotion scene file. Every scene imports a shared look + motion engine. Finished scenes drop onto one main timeline.

This repo is not a vintage 12fps film-grain project. The house look is cinematic editorial stills: objects, rooms, silhouettes, slow Ken Burns / parallax / fake depth in code, cool/neutral grade, optional vignette. Captions are locked **Karaoke Highlight** (Montserrat Black, 8px black stroke, active word `#FFE14A`).

## Quick start

```bash
npm install
npm run preview    # Remotion Studio
npm run render     # mp4 of the sample episode → out/quiet-hour.mp4
```

Sample episode: **The Quiet Hour** (7 lines, 31 seconds). No TTS, no paid still APIs, no brand logos, no real-person likenesses. Stills are in-repo SVGs.

## How an episode is built

1. Write a locked voiceover (ordered lines).
2. Emit an episode JSON that matches `EpisodeSpec` (`src/engine/types.ts`). A factory can emit this file; `parseEpisode()` validates it.
3. Add stills under `public/episodes/<id>/stills/` (layered SVGs/PNGs).
4. Add **one scene file per spoken line** under `src/episodes/<id>/scenes/`.
5. Register those files on the episode timeline (`src/episodes/<id>/index.ts`) and in `src/Root.tsx`.

Clone-don't-rebuild: later episodes copy the engine, swap JSON + stills + scene files. Do not fork a new Remotion project.

### Scene file ↔ voiceover line

```
src/episodes/quiet-hour/scenes/Scene01QuietHour.tsx
```

maps to `voiceoverLineId: "vo-01"` in `episode.json`. The file imports `SceneFrame` / `LookEngine` from `src/engine`. Preview that composition alone in Studio (`QuietHour-01`) or watch it sequenced on `QuietHour`.

### JSON spec (minimum)

| Field | Role |
| --- | --- |
| `id`, `title`, `targetDurationSec` | Episode identity. Duration must be 25–50s. |
| `voiceover[]` | Ordered lines: `id`, `text`, `approximateDurationSec`, optional `audioFile`. |
| `scenes[]` | One per line: `voiceoverLineId`, `durationInFrames`, `stills` (bg + layers), `captions`, `motion`, optional `grade`. |
| `audio` | Optional locked VO wav/mp3 + optional bed. If missing, JSON durations drive the timeline so preview still works. |
| `fonts` | Overlay captions are Karaoke Highlight (Montserrat Black 900). |
| `grade` | Cool/neutral defaults inherited by every scene. |

Stills: `{ src, x, y, scale, opacity, depth, blend? }`. `depth` 0 is background; 1 is foreground (extra parallax). Paths are relative to `public/` and loaded with `staticFile()`.

Keep **key art out of y=1200–1440**. Karaoke Highlight captions live in that band (`CAPTION_BAND` in `src/engine/constants.ts`): last-line baseline at y=1320, text x 140–940, max ~800px line, 3–6 word chunks. `LookEngine` also lays a dark wash there so type stays readable.

## What LookEngine does

`LookEngine` is the shared wrapper every scene renders through:

- Cool/neutral grade (contrast / saturation / brightness / cool multiply / optional vignette)
- Caption-safe darkness over y=1200–1440
- Overflow crop for Ken Burns

Motion helpers live next to it (`src/engine/motion.ts`):

- `useKenBurns` — slow push/pull/pan
- `parallaxOffset` — fake depth from layered stills
- `useEntrance` — spring fade/scale
- `useKaraokeIndex` — per-word highlight paced from scene duration (no TTS). Only the current word is yellow; the rest of the chunk stays white.

Tune **timing, scale, grade, caption, and motion** live in Remotion Studio. Those values are Remotion schema props (`src/engine/schemas.ts`). Stills stay in JSON.

## Output

- Size: **1080×1920**
- Frame rate: **30fps**
- Sample composition id: `QuietHour`
- Per-line compositions: `QuietHour-01` … `QuietHour-07`

## Fonts

Captions use **Montserrat Black (900)** loaded via `@remotion/google-fonts/Montserrat` (SIL Open Font License). Do not use DM Sans or Bebas Neue for captions. The locked Karaoke Highlight look is:

- Inactive words: 68px, fill `#FFFFFF`
- Active word: 71px, fill `#FFE14A`
- Stroke: 8px `#000000` on every word (two-layer span: back `WebkitTextStroke`, front fill)
- Shadow: `0px 4px 0 rgba(0,0,0,0.55)`
- Casing as spoken. Never all-caps. Never rewrite the line.

## Adding a new episode

1. Copy `src/episodes/quiet-hour/` and `public/episodes/quiet-hour/`.
2. Replace `episode.json` (new VO lines + still paths + motion).
3. Add one scene file per new line (copy `Scene01QuietHour.tsx`, change `SCENE_ID` / `VOICEOVER_LINE_ID`).
4. Wire the files in that episode's `index.ts` and add a `<Folder>` in `src/Root.tsx`.
5. Point `npm run render` at the new composition id if you want that to be the default.

When a locked VO file exists, put it in `public/` and set `audio.voiceover`. `calculateEpisodeMetadata` will then drive duration from the wav/mp3. Until then, `durationInFrames` on each scene is `round(approximateDurationSec * 30)`.

Episode 1 lives at `src/episodes/github-2008/` (composition `Github2008`). CaptionBand is disabled there so karaoke can be burned later. Stills clip to the 1080×1200 picture window. OS lockups are Remotion text via `OsLockup`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run preview` | Opens Remotion Studio |
| `npm run render` | Renders `Github2008` to `out/github-2008.mp4` |
| `npm run render:quiet-hour` | Renders `QuietHour` to `out/quiet-hour.mp4` |
| `npm run typecheck` | `tsc` |

## Legal / content

Do not add unauthorized logos, real-person likenesses, Google-scraped brand photos, or generated founder faces. Placeholder stills in this repo are abstract rooms, objects, and silhouettes drawn as SVG.

This project does not implement TTS.

## DO NOT

Do **not** implement or reintroduce any of the following as the house look:

- Scan lines
- `grain.jpg` multiply (or any film-grain texture)
- Grunge colour-burn overlays
- Gate-weave / film jitter
- Posterize-to-12fps stutter
- A `FilmTreatment` wrapper
- Stop-motion judder as the default motion
- Vintage film-soak color as the default grade
- Caption styles that are not Karaoke Highlight (no kicker, no left bar, no underline, no dim-gray unspoken words, no “editorial sans / no stroke”)

If you need texture, keep it in the stills (a real photograph of a room), not as a global 12fps treatment.
