import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {LINE_GAP_SEC, SAMPLE_RATE} from '../../engine/constants';
import type {TimestampsDoc, WordStamp} from '../schema/episode';
import {spokenWords} from '../copy/engine';

/** 16-bit PCM WAV, mono, 24 kHz. Fixture / mock TTS path. */
export const encodeSilenceWav = (
  durationSec: number,
  sampleRate = SAMPLE_RATE,
): Buffer => {
  const samples = Math.max(1, Math.round(durationSec * sampleRate));
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const sample = Math.round(Math.sin(2 * Math.PI * 196 * t) * 1800);
    buffer.writeInt16LE(sample, 44 + i * 2);
  }
  return buffer;
};

export const writeWav = (path: string, durationSec: number): void => {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, encodeSilenceWav(durationSec));
};

export const wordTimestampsForText = (
  text: string,
  durationSec: number,
  startOffset = 0,
): WordStamp[] => {
  const words = spokenWords(text);
  if (words.length === 0) {
    return [];
  }
  const lead = 0.08;
  const usable = Math.max(0.05, durationSec - 0.12);
  const weights = words.map((w) => Math.max(1, w.length));
  const total = weights.reduce((a, b) => a + b, 0);
  let t = startOffset + lead;
  return words.map((word, i) => {
    const span = usable * (weights[i] / total);
    const stamp = {word, start: round4(t), end: round4(t + span)};
    t += span;
    return stamp;
  });
};

const round4 = (n: number): number => Math.round(n * 10000) / 10000;

export const durationForLine = (text: string): number => {
  const words = spokenWords(text);
  return Math.max(1.6, words.length * 0.28 + 0.35);
};

export const buildFixtureTimestamps = (opts: {
  slug: string;
  lines: {id: string; text: string; file: string}[];
}): TimestampsDoc => {
  let cursor = 0;
  const stamped = opts.lines.map((line, i) => {
    const duration = durationForLine(line.text);
    const words = wordTimestampsForText(line.text, duration, cursor);
    const start = cursor;
    const end = cursor + duration;
    cursor = end + LINE_GAP_SEC;
    return {
      i: i + 1,
      text: line.text,
      file: line.file,
      start,
      end,
      duration,
      words,
    };
  });
  return {
    episode: opts.slug,
    engine: 'fixture-tts',
    voice: 'am_michael',
    speed: 0.95,
    lang: 'en-us',
    sampleRate: SAMPLE_RATE,
    gapSeconds: LINE_GAP_SEC,
    totalDuration: Math.max(0, cursor - LINE_GAP_SEC),
    fixture: true,
    lines: stamped,
  };
};
