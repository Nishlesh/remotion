import {describe, expect, it} from 'vitest';
import {durationGate, dimensionGate} from '../src/factory/qa/durationGate';
import {compareWords} from '../src/factory/qa/checks';
import type {TimestampsDoc} from '../src/factory/schema/episode';

describe('duration gate', () => {
  it('fails above 50.0s', () => {
    const gate = durationGate(50.01);
    expect(gate.ok).toBe(false);
    expect(gate.code).toBe('duration_over_50');
  });

  it('passes 35–45 production window', () => {
    expect(durationGate(42.2).ok).toBe(true);
    expect(durationGate(25).ok).toBe(true);
    expect(durationGate(50).ok).toBe(true);
  });

  it('fails under 25s unless fixture', () => {
    expect(durationGate(8.9).ok).toBe(false);
    expect(durationGate(8.9, {fixture: true}).ok).toBe(true);
  });
});

describe('dimension gate', () => {
  it('rejects 1088×1920', () => {
    const gate = dimensionGate(1088, 1920);
    expect(gate.ok).toBe(false);
    expect(gate.code).toBe('width_1088');
  });

  it('accepts 1080×1920', () => {
    expect(dimensionGate(1080, 1920).ok).toBe(true);
  });
});

describe('timestamp vs spoken words', () => {
  const stamps: TimestampsDoc = {
    episode: 'x',
    engine: 'fixture-tts',
    voice: 'am_michael',
    speed: 0.95,
    sampleRate: 24000,
    gapSeconds: 0.1,
    totalDuration: 2,
    lines: [
      {
        i: 1,
        text: 'Hello world.',
        file: '01.wav',
        start: 0,
        end: 2,
        duration: 2,
        words: [
          {word: 'Hello', start: 0.1, end: 0.5},
          {word: 'world.', start: 0.5, end: 1.8},
        ],
      },
    ],
  };

  it('passes when words match exactly', () => {
    expect(compareWords('Hello world.', stamps)).toEqual([]);
  });

  it('fails when spoken words were rewritten', () => {
    const issues = compareWords('Hello there.', stamps);
    expect(issues.some((i) => i.code === 'timestamp_word_mismatch')).toBe(true);
  });
});
