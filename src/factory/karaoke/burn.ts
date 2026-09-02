import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {repoRoot} from '../paths';
import {assertPlayRes, buildKaraokeAss, flattenTimestamps} from './ass';
import type {TimestampsDoc} from '../schema/episode';

export const which = (bin: string): string | null => {
  const result = spawnSync('which', [bin], {encoding: 'utf8'});
  if (result.status !== 0) {
    return null;
  }
  return result.stdout.trim() || null;
};

export const ffmpegBin = (): string => {
  const bin = which('ffmpeg');
  if (!bin) {
    throw new Error('ffmpeg not found. Karaoke burn requires ffmpeg ass filter.');
  }
  return bin;
};

export const fontDir = (): string => join(repoRoot(), 'assets', 'fonts');

export const writeAssFile = (outPath: string, timestamps: TimestampsDoc): string => {
  const words = flattenTimestamps(timestamps.lines);
  const ass = buildKaraokeAss(words);
  assertPlayRes(ass);
  mkdirSync(dirname(outPath), {recursive: true});
  writeFileSync(outPath, ass, 'utf8');
  return outPath;
};

/**
 * Burn karaoke with ffmpeg `ass` filter only. Never `subtitles`.
 */
export const burnKaraoke = (opts: {
  inputMp4: string;
  assPath: string;
  outputMp4: string;
}): {ok: true; output: string} | {ok: false; reason: string} => {
  if (!existsSync(opts.inputMp4)) {
    return {ok: false, reason: `assemble missing: ${opts.inputMp4}`};
  }
  if (!existsSync(opts.assPath)) {
    return {ok: false, reason: `ASS missing: ${opts.assPath}`};
  }
  const ffmpeg = which('ffmpeg');
  if (!ffmpeg) {
    return {ok: false, reason: 'ffmpeg not found; skip karaoke burn'};
  }
  mkdirSync(dirname(opts.outputMp4), {recursive: true});
  const fonts = fontDir();
  const filter = `ass=${opts.assPath}:fontsdir=${fonts}`;
  const result = spawnSync(
    ffmpeg,
    [
      '-y',
      '-i',
      opts.inputMp4,
      '-vf',
      filter,
      '-c:a',
      'copy',
      opts.outputMp4,
    ],
    {encoding: 'utf8'},
  );
  if (result.status !== 0) {
    return {
      ok: false,
      reason: result.stderr || result.stdout || 'ffmpeg ass filter failed',
    };
  }
  return {ok: true, output: opts.outputMp4};
};
