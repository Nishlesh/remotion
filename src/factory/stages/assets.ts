import {copyFileSync, existsSync, mkdirSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {CHANNEL_GRADE, DEFAULT_KEN_BURNS} from '../../engine/gradeDefaults';
import {HEIGHT, WIDTH} from '../../engine/constants';
import {STILL_PROMPT_LOCK} from '../prompts/templates';
import {
  isFixture,
  publicEpisodeDir,
  readJson,
  readMeta,
  resolveEpisodeDir,
  writeJson,
  writeText,
} from '../paths';
import {
  scriptSchema,
  storyboardSchema,
  timestampsSchema,
  type LicenseRecord,
} from '../schema/episode';
import {applyCoverCrop} from '../stills/applyCoverCrop';
import {secToFrames} from '../../engine/duration';
import type {EpisodeSpec, SceneSpec} from '../../engine/types';

const IMAGE_EXT = /\.(jpg|jpeg|png|webp)$/i;

export const syncPublicAssets = (slug: string): void => {
  const dir = resolveEpisodeDir(slug);
  const pub = publicEpisodeDir(slug);
  mkdirSync(join(pub, 'stills'), {recursive: true});
  mkdirSync(join(pub, 'audio'), {recursive: true});
  const stills = join(dir, 'stills');
  if (existsSync(stills)) {
    for (const file of readdirSync(stills)) {
      if (!IMAGE_EXT.test(file)) {
        continue;
      }
      copyFileSync(join(stills, file), join(pub, 'stills', file));
    }
  }
  const audio = join(dir, 'audio');
  if (existsSync(audio)) {
    for (const file of readdirSync(audio)) {
      if (!/\.(wav|mp3|json)$/i.test(file)) {
        continue;
      }
      copyFileSync(join(audio, file), join(pub, 'audio', file));
    }
  }
};

export const buildRemotionSpec = (slug: string): EpisodeSpec => {
  const dir = resolveEpisodeDir(slug);
  const meta = readMeta(slug);
  const script = scriptSchema.parse(readJson(join(dir, 'script.json')));
  const board = storyboardSchema.parse(readJson(join(dir, 'storyboard.json')));
  const stamps = timestampsSchema.parse(readJson(join(dir, 'audio', 'timestamps.json')));

  const scenes: SceneSpec[] = board.beats.map((beat, i) => {
    const line = stamps.lines[i];
    const durationSec = (beat.endSec - beat.startSec) || line?.duration || 2;
    const stillFile = `${beat.stillId}.jpg`;
    const src = existsSync(join(dir, 'stills', stillFile))
      ? `episodes/${slug}/stills/${stillFile}`
      : `episodes/${slug}/stills/${beat.stillId}.png`;
    const ctaStill =
      /focusstack/i.test(line?.text ?? script.lines[i]?.text ?? '') ||
      /focusstack/i.test(beat.visual);
    return {
      id: beat.id,
      voiceoverLineId: beat.voiceoverLineId,
      durationInFrames: secToFrames(durationSec),
      fadeInFrames: i === 0 ? 10 : 8,
      fadeOutFrames: 8,
      osLockup: beat.osLockup ?? null,
      captions: {
        text: line?.text ?? script.lines[i]?.text ?? '',
        kicker: '',
        highlightBias: 0.45,
      },
      motion: {
        kenBurns: ctaStill
          ? {
              startScale: 1,
              endScale: 1.025,
              startX: 0,
              endX: 2,
              startY: 0,
              endY: 2,
            }
          : {
              ...DEFAULT_KEN_BURNS,
              endX: i % 2 === 0 ? 8 : -8,
            },
        parallax: {amount: 0},
        entrance: {damping: 22},
      },
      grade: ctaStill
        ? {
            contrast: 1.02,
            saturation: 0.96,
            brightness: 1,
            cool: 0,
            warm: 0.04,
            grain: 0.08,
            vignette: 0.18,
          }
        : undefined,
      stills: {
        bg: {
          id: beat.stillId,
          src,
          x: 0,
          y: 0,
          width: WIDTH,
          height: HEIGHT,
          scale: 1,
          opacity: 1,
          depth: 0,
          objectFit: 'fill',
          objectPosition: 'top',
          transformOrigin: 'center top',
        },
        layers: [],
      },
    };
  });

  return {
    id: slug,
    title: meta.title,
    compositionId: meta.compositionId,
    targetDurationSec: Math.min(50, stamps.totalDuration),
    captionsEnabled: false,
    fonts: {display: 'Montserrat', body: 'Montserrat'},
    audio: {
      voiceover: `episodes/${slug}/audio/vo_concat.wav`,
      bed: null,
    },
    grade: CHANNEL_GRADE,
    voiceover: script.lines.map((line, i) => ({
      id: line.id,
      text: line.text,
      approximateDurationSec: stamps.lines[i]?.duration ?? 2,
      audioFile: `episodes/${slug}/audio/${stamps.lines[i]?.file ?? `${String(i + 1).padStart(2, '0')}.wav`}`,
    })),
    scenes,
  };
};

export const assetsStage = async (slug: string) => {
  const dir = resolveEpisodeDir(slug);
  const board = storyboardSchema.parse(readJson(join(dir, 'storyboard.json')));
  const licenses: LicenseRecord[] = [];
  const searchPlan: {stillId: string; query: string; prefer: string}[] = [];

  writeText(join(dir, 'prompts', 'still-lock.md'), STILL_PROMPT_LOCK);

  for (const beat of board.beats) {
    const jpg = join(dir, 'stills', `${beat.stillId}.jpg`);
    const png = join(dir, 'stills', `${beat.stillId}.png`);
    const found = existsSync(jpg) ? jpg : existsSync(png) ? png : null;
    if (!found) {
      searchPlan.push({
        stillId: beat.stillId,
        query: beat.visual,
        prefer: beat.sourcePreference ?? 'wikimedia',
      });
      writeText(
        join(dir, 'generate', `${beat.stillId}.prompt.txt`),
        `${STILL_PROMPT_LOCK}\n\nScene: ${beat.visual}\n`,
      );
      continue;
    }
    const cropped = join(dir, 'stills', `${beat.stillId}.jpg`);
    applyCoverCrop(found, cropped);
    licenses.push({
      stillId: beat.stillId,
      file: `stills/${beat.stillId}.jpg`,
      source: isFixture(slug) ? 'fixture' : 'generate',
      license: isFixture(slug) ? 'fixture-synthetic' : 'generated-gap',
      coverCropped: true,
      width: WIDTH,
      height: HEIGHT,
    });
  }

  writeJson(join(dir, 'licenses.json'), licenses);
  writeJson(join(dir, 'stock', 'search-plan.json'), {
    note: 'Use Wikimedia/Unsplash/Pexels/Pixabay APIs or official download pages. Do not scrape copyrighted stills. Do not implement unauthorized logos.',
    plan: searchPlan,
  });

  const spec = buildRemotionSpec(slug);
  writeJson(join(dir, 'remotion.json'), spec);
  syncPublicAssets(slug);
  writeJson(join(dir, 'meta.json'), {...readMeta(slug), status: 'assets'});
  return {licenses, searchPlan, spec};
};
