# Before It Was Famous — Shorts factory

Production pipeline for **Before It Was Famous** (`@beforeitwasfamous`) YouTube Shorts.

This repo keeps the Remotion look engine that already worked (1080×1920, VO-driven duration, Ken Burns, Karaoke Highlight preview) and adds the rest of the factory as code: typed episode folders, a single CLI, karaoke burn, QA, and human file gates.

FocusStack ([usefocusstack.com](https://usefocusstack.com)) is a **Level-2 natural close**, never an ad, never the channel. Would someone watch the episode if FocusStack did not exist? If no, reject the story.

**Never auto-publish.** There are no social posting APIs.

## Quick start

```bash
pnpm install
pnpm fixture:media          # synthetic wav + 1080×1920 stills + timestamps
pnpm test
pnpm factory status --episode _fixture-pipeline
pnpm preview                # Remotion Studio
```

Fixture assemble + karaoke (requires Remotion + ffmpeg):

```bash
pnpm factory render --episode _fixture-pipeline
# → episodes/_fixture-pipeline/render/assemble.mp4
# → episodes/_fixture-pipeline/render/karaoke.ass
# → episodes/_fixture-pipeline/render/final.mp4
```

Equivalent Remotion command if you skip the CLI:

```bash
pnpm exec remotion render FixturePipeline out/fixture-pipeline.mp4 --timeout=180000
```

If ffmpeg or Remotion are missing, CI tests skip the burn and print that command. Production lock is still **1080×1920**, never 1088×1920.

## Pipeline (never skip)

```
discover → score → research → FACT_APPROVED → hooks/script → TTS
       → NARRATION_LOCKED → storyboard 8–12 → stills → Remotion assemble
       → karaoke from FINAL audio → QA → package → (publish stub)
```

```bash
pnpm factory <stage> --episode <slug>
pnpm factory run --episode <slug> --until qa
```

Stages: `discover` `score` `research` `script` `audio` `storyboard` `assets` `render` `qa` `package` `publish`.

| Gate file | Required before |
| --- | --- |
| `episodes/<slug>/FACT_APPROVED` | `script` (production) |
| `episodes/<slug>/NARRATION_LOCKED` | `storyboard` (production) |
| `episodes/<slug>/PUBLISH_GO` | `publish` — and publish still refuses to post |

Score lock: **≥70**, pivotal **≥3/5**, **two reliable sources**, fits **≤50s**.

Discover / research start as structured stubs + prompt templates. They do not invent facts. Set `OPENAI_API_KEY` to use the OpenAI-compatible interface (default model name `gpt-5.6-sol`). Without a key, `FACTORY_LLM=mock`.

## Copy engine (hard lock)

FAMOUS ENTITY → unexpected beginning → human detail → constraint → choice → consequence → realization → viewer → FocusStack.

- Cadence: 3–12 word clauses, fragments legal, ~80–100 spoken words
- Gold shape: Airbnb / Spanx micro-doc (not Wikipedia)
- Fame test: unknown founders cannot lead; famous product/company leads
- Drop rule: spoken script keeps only hook, one human detail, one constraint, one choice, one consequence, one meaning, one CTA
- CTA callbacks **this** story. No sale-price ending
- Script ≠ N Remotion stills
- `FACT_APPROVED` before script. Never invent facts

## Remotion engine (kept)

`src/engine` is the compositor from the prior Github 2008 work, extended not replaced:

- **1080×1920 @ 30fps** full bleed (`WIDTH=1080` — never 1088)
- VO is source of truth; `calculateEpisodeMetadata` reads the wav
- Shared `LookEngine`: grade, **warm**, **grain**, vignette as tunables
- Ken Burns on already cover-cropped 1080×1920 plates (`object-fit: fill`)
- `CaptionBand` for Studio preview (Karaoke Highlight)
- Production captions: **ffmpeg `ass` filter only** (never `subtitles`)
- Existing compositions: `Github2008`, `QuietHour`, `FixturePipeline`, `FactoryActive`

Channel default grade is Magnates-style warm film + grain. Github 2008 keeps its cool/neutral grade (grain 0).

Do not clone third-party 12fps kits, prompts, or assets.

## Karaoke Highlight (burn)

- Montserrat Black
- Inactive 68px white, active 71px `#FFE14A`, 8px black stroke
- Max 2 lines, last-line baseline y=1320
- Sentence-final `.!?` ends a chunk
- Do not rewrite spoken words
- ASS PlayRes **1080×1920**, Alignment **2**, MarginL/R **140**, MarginV **600**
- Active word `{\c&H4AE1FF&\fs71}` over the full visible chunk
- Font file: `assets/fonts/Montserrat-Black.ttf`

## Voice / TTS

Production path:

1. Install `kokoro-onnx` + models under `tools/models/` (`kokoro-v1.0.onnx`, `voices-v1.0.bin`)
2. `pip install -r requirements.txt` plus `kokoro-onnx soundfile numpy`
3. `tools/tts_kokoro.py` — voice `am_michael`, speed **0.95**, **24 kHz**
4. One spoken line = one WAV, then concat (`LINE_GAP_SEC=0.1`)
5. Word-level timestamps in `audio/timestamps.json`

This VM often cannot run kokoro-onnx. The factory then uses **fixture TTS**: 24 kHz tone WAV + even word timestamps from the spoken text (no rewritten words). Documented, not a fake production read. Create `NARRATION_LOCKED` only after a real listen.

## Stills

1. Wikimedia / Unsplash / Pexels / Pixabay first (official APIs / download pages)
2. Generate gaps only. No unauthorized logos. No copyrighted scrapes
3. **Always cover-crop to 1080×1920** (`tools/cover_crop.py` via Pillow; ffmpeg fallback)
4. Record `licenses.json`
5. Hero in y≈80–1100; y=1200–1440 stays photo — never paint a caption bar into the still
6. Identity plate per named person if they appear more than once

## Episode folders

```
episodes/<slug>/
  meta.json
  discovery.json  score.json  research.json
  FACT_APPROVED                 # human
  script.json
  audio/01.wav … vo_concat.wav timestamps.json
  NARRATION_LOCKED              # human
  storyboard.json
  stills/  stock/  generate/  licenses.json
  remotion.json
  render/assemble.mp4 karaoke.ass final.mp4
  qa.json
  package/
  PUBLISH_GO                    # human, still does not post
```

Remotion stills/audio are synced to `public/episodes/<slug>/` at the assets/render stages.

## QA (deterministic)

- width/height **1080×1920**, fail on **1088**
- duration ≤ 50.0s (production also ≥ 25s; fixtures may be shorter)
- `FACT_APPROVED` present (production)
- timestamps words === spoken words
- stills exist

```bash
pnpm factory qa --episode _fixture-pipeline
```

## Tests

```bash
pnpm test
pnpm typecheck
```

Coverage: schema, caption chunker, cover-crop math, duration/1088 gates, copy engine, human gates, karaoke ASS. Fixture render is attempted when ffmpeg + Remotion exist; otherwise skipped with the command in this README.

## Secrets

See `.env.example`. Keys via env only. Never commit `.env`.

## Scripts

| Script | What |
| --- | --- |
| `pnpm factory …` | Pipeline CLI |
| `pnpm fixture:media` | Build fixture wav/stills/timestamps |
| `pnpm preview` | Remotion Studio |
| `pnpm render` | Github2008 sample |
| `pnpm render:fixture` | Fixture assemble + karaoke |
| `pnpm test` | Vitest |
| `pnpm typecheck` | `tsc` |

## Legal

Do not add unauthorized logos, scrape copyrighted stills, or invent biography. Placeholder fixture stills are synthetic color plates. Github 2008 stills in `public/` are from the prior engine work and stay episode-local.
