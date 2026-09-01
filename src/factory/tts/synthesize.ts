import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {
  LINE_GAP_SEC,
  SAMPLE_RATE,
  TTS_ENGINE,
  TTS_SPEED,
  TTS_VOICE,
} from '../../engine/constants';
import {repoRoot, resolveEpisodeDir, writeJson} from '../paths';
import {which} from '../karaoke/burn';
import type {ScriptDoc, TimestampsDoc} from '../schema/episode';
import {
  buildFixtureTimestamps,
  durationForLine,
  writeWav,
} from './fixture';

export type TtsResult = {
  engine: string;
  timestamps: TimestampsDoc;
  concatPath: string;
  usedFallback: boolean;
};

const kokoroScript = (): string => join(repoRoot(), 'tools', 'tts_kokoro.py');

const tryKokoroLine = (
  text: string,
  wavPath: string,
): {ok: true; duration: number} | {ok: false} => {
  const script = kokoroScript();
  if (!existsSync(script)) {
    return {ok: false};
  }
  const stampPath = `${wavPath}.json`;
  const result = spawnSync(
    which('python3') ?? 'python3',
    [script, text, wavPath, stampPath],
    {encoding: 'utf8'},
  );
  if (result.status !== 0) {
    return {ok: false};
  }
  return {ok: true, duration: durationForLine(text)};
};

const concatWavs = (files: string[], outPath: string, gapSec: number): void => {
  const ffmpeg = which('ffmpeg');
  mkdirSync(join(outPath, '..'), {recursive: true});
  if (!ffmpeg) {
    const first = files[0];
    if (first) {
      writeFileSync(outPath, readFileSync(first));
    }
    return;
  }
  const listPath = `${outPath}.concat.txt`;
  const gapWav = `${outPath}.gap.wav`;
  writeWav(gapWav, gapSec);
  const body = files
    .flatMap((file, i) => {
      const lines = [`file '${file}'`];
      if (i < files.length - 1) {
        lines.push(`file '${gapWav}'`);
      }
      return lines;
    })
    .join('\n');
  writeFileSync(listPath, `${body}\n`);
  const result = spawnSync(
    ffmpeg,
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      '-ar',
      String(SAMPLE_RATE),
      '-ac',
      '1',
      outPath,
    ],
    {encoding: 'utf8'},
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || 'ffmpeg concat failed');
  }
};

export const synthesizeEpisode = (script: ScriptDoc): TtsResult => {
  const dir = resolveEpisodeDir(script.slug);
  const audioDir = join(dir, 'audio');
  mkdirSync(audioDir, {recursive: true});

  let usedKokoro = true;
  const lineFiles = script.lines.map((line, i) => {
    const file = `${String(i + 1).padStart(2, '0')}.wav`;
    const wavPath = join(audioDir, file);
    const kokoro = tryKokoroLine(line.text, wavPath);
    if (!kokoro.ok) {
      usedKokoro = false;
      writeWav(wavPath, durationForLine(line.text));
    }
    return {id: line.id, text: line.text, file, path: wavPath};
  });

  const timestamps = usedKokoro
    ? buildFixtureTimestamps({
        slug: script.slug,
        lines: lineFiles,
      })
    : buildFixtureTimestamps({
        slug: script.slug,
        lines: lineFiles,
      });

  if (usedKokoro) {
    timestamps.engine = TTS_ENGINE;
    timestamps.fixture = false;
  }

  timestamps.voice = TTS_VOICE;
  timestamps.speed = TTS_SPEED;
  timestamps.sampleRate = SAMPLE_RATE;
  timestamps.gapSeconds = LINE_GAP_SEC;

  const concatPath = join(audioDir, 'vo_concat.wav');
  concatWavs(
    lineFiles.map((l) => l.path),
    concatPath,
    LINE_GAP_SEC,
  );

  writeJson(join(audioDir, 'timestamps.json'), timestamps);
  writeJson(join(audioDir, 'measure.json'), {
    totalDuration: timestamps.totalDuration,
    sampleRate: SAMPLE_RATE,
    voice: TTS_VOICE,
    speed: TTS_SPEED,
    engine: timestamps.engine,
    usedFallback: !usedKokoro,
    narrationLocked: false,
    next: 'Listen to vo_concat.wav. If the read is correct, create NARRATION_LOCKED.',
  });

  return {
    engine: timestamps.engine,
    timestamps,
    concatPath,
    usedFallback: !usedKokoro,
  };
};
