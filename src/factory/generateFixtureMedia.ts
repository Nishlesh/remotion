import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {HEIGHT, WIDTH} from '../engine/constants';
import {CHANNEL_GRADE, DEFAULT_KEN_BURNS} from '../engine/gradeDefaults';
import {secToFrames} from '../engine/duration';
import {readJson, repoRoot, writeJson} from './paths';
import {scriptSchema} from './schema/episode';
import {buildFixtureTimestamps, writeWav} from './tts/fixture';
import {which} from './karaoke/burn';
import type {EpisodeSpec} from '../engine/types';

const SLUG = '_fixture-pipeline';

const stillColors = ['#2a1810', '#1c2733', '#3a2416'];

export const generateFixtureMedia = (): void => {
  const root = repoRoot();
  const dir = join(root, 'episodes', SLUG);
  const script = scriptSchema.parse(readJson(join(dir, 'script.json')));
  const audioDir = join(dir, 'audio');
  mkdirSync(audioDir, {recursive: true});
  mkdirSync(join(dir, 'stills'), {recursive: true});
  mkdirSync(join(root, 'public', 'episodes', SLUG, 'stills'), {recursive: true});
  mkdirSync(join(root, 'public', 'episodes', SLUG, 'audio'), {recursive: true});
  mkdirSync(join(root, 'public', 'engine'), {recursive: true});
  mkdirSync(join(root, 'assets', 'fonts'), {recursive: true});

  const lines = script.lines.map((line, i) => ({
    id: line.id,
    text: line.text,
    file: `${String(i + 1).padStart(2, '0')}.wav`,
  }));
  const timestamps = buildFixtureTimestamps({slug: SLUG, lines});
  for (const line of timestamps.lines) {
    writeWav(join(audioDir, line.file), line.duration);
  }

  const ffmpeg = which('ffmpeg');
  if (ffmpeg) {
    const concatList = join(audioDir, 'concat.txt');
    const gap = join(audioDir, 'gap.wav');
    writeWav(gap, timestamps.gapSeconds);
    writeFileSync(
      concatList,
      timestamps.lines
        .flatMap((line, i) => {
          const rows = [`file '${join(audioDir, line.file)}'`];
          if (i < timestamps.lines.length - 1) {
            rows.push(`file '${gap}'`);
          }
          return rows;
        })
        .join('\n') + '\n',
    );
    spawnSync(
      ffmpeg,
      [
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        concatList,
        '-ar',
        '24000',
        '-ac',
        '1',
        join(audioDir, 'vo_concat.wav'),
      ],
      {encoding: 'utf8'},
    );
  } else {
    writeWav(join(audioDir, 'vo_concat.wav'), timestamps.totalDuration);
  }

  writeJson(join(audioDir, 'timestamps.json'), timestamps);

  stillColors.forEach((color, i) => {
    const id = `still-0${i + 1}`;
    const out = join(dir, 'stills', `${id}.jpg`);
    if (ffmpeg) {
      spawnSync(
        ffmpeg,
        [
          '-y',
          '-f',
          'lavfi',
          '-i',
          `color=c=${color}:s=${WIDTH}x${HEIGHT}:d=1`,
          '-frames:v',
          '1',
          '-q:v',
          '4',
          out,
        ],
        {encoding: 'utf8'},
      );
    }
  });

  const grain = join(root, 'public', 'engine', 'film-grain.png');
  if (ffmpeg) {
    spawnSync(
      ffmpeg,
      [
        '-y',
        '-f',
        'lavfi',
        '-i',
        'color=c=gray:s=256x256:d=1',
        '-vf',
        "format=gray,geq=lum='128+120*(random(0)-0.5)'",
        '-frames:v',
        '1',
        grain,
      ],
      {encoding: 'utf8'},
    );
  }

  const board = {
    slug: SLUG,
    narrationLocked: true as const,
    durationSec: timestamps.totalDuration,
    beats: timestamps.lines.map((line, i) => ({
      id: `b0${i + 1}`,
      index: i + 1,
      startSec: line.start,
      endSec: line.end,
      voiceoverLineId: script.lines[i].id,
      visual: line.text,
      stillId: `still-0${i + 1}`,
      osLockup:
        i === 0
          ? {text: 'Kitchen table', y: 180, size: 'plate' as const}
          : null,
      identityPlate: null,
      sourcePreference: 'generate' as const,
    })),
    identityPlates: [],
  };
  writeJson(join(dir, 'storyboard.json'), board);

  const spec: EpisodeSpec = {
    id: SLUG,
    title: 'Fixture: kitchen-table ship',
    compositionId: 'FixturePipeline',
    targetDurationSec: timestamps.totalDuration,
    captionsEnabled: false,
    fonts: {display: 'Montserrat', body: 'Montserrat'},
    audio: {
      voiceover: `episodes/${SLUG}/audio/vo_concat.wav`,
      bed: null,
    },
    grade: CHANNEL_GRADE,
    voiceover: script.lines.map((line, i) => ({
      id: line.id,
      text: line.text,
      approximateDurationSec: timestamps.lines[i].duration,
      audioFile: `episodes/${SLUG}/audio/${timestamps.lines[i].file}`,
    })),
    scenes: board.beats.map((beat, i) => ({
      id: beat.id,
      voiceoverLineId: beat.voiceoverLineId,
      durationInFrames: secToFrames(timestamps.lines[i].duration),
      fadeInFrames: i === 0 ? 10 : 8,
      fadeOutFrames: 8,
      osLockup: beat.osLockup,
      captions: {
        text: timestamps.lines[i].text,
        kicker: '',
        highlightBias: 0.45,
      },
      motion: {
        kenBurns: {...DEFAULT_KEN_BURNS, endX: i === 1 ? -8 : 8},
        parallax: {amount: 0},
        entrance: {damping: 22},
      },
      stills: {
        bg: {
          id: beat.stillId,
          src: `episodes/${SLUG}/stills/${beat.stillId}.jpg`,
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
    })),
  };

  writeJson(join(dir, 'remotion.json'), spec);
  writeJson(join(root, 'src', 'episodes', SLUG, 'episode.json'), spec);
  writeJson(join(dir, 'licenses.json'), board.beats.map((beat) => ({
    stillId: beat.stillId,
    file: `stills/${beat.stillId}.jpg`,
    source: 'fixture',
    license: 'fixture-synthetic',
    coverCropped: true,
    width: WIDTH,
    height: HEIGHT,
  })));

  const pub = join(root, 'public', 'episodes', SLUG);
  spawnSync('cp', ['-R', join(dir, 'stills'), pub], {encoding: 'utf8'});
  spawnSync('cp', ['-R', join(dir, 'audio'), pub], {encoding: 'utf8'});
};

if (process.argv[1]?.includes('generateFixtureMedia')) {
  generateFixtureMedia();
}
