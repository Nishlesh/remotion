import {describe, expect, it} from 'vitest';
import {
  chunkSpokenLine,
  isSentenceFinalWord,
  splitWords,
  wrapChunkLines,
} from '../src/engine/captionLayout';
import {buildKaraokeAss, chunkTimestampedWords, assTime} from '../src/factory/karaoke/ass';

describe('caption chunker', () => {
  it('ends a chunk on sentence-final .!?', () => {
    const words = splitWords('They had one weekend. No spare rooms.');
    const chunks = chunkSpokenLine(words);
    expect(chunks.map((c) => c.join(' '))).toEqual([
      'They had one weekend.',
      'No spare rooms.',
    ]);
    expect(isSentenceFinalWord('weekend.')).toBe(true);
    expect(isSentenceFinalWord('weekend')).toBe(false);
  });

  it('does not rewrite spoken words or casing', () => {
    const spoken = 'GitHub started at 10:24 on a Friday night.';
    const words = splitWords(spoken);
    expect(words.join(' ')).toBe(spoken);
    const chunks = chunkSpokenLine(words);
    expect(chunks.flat().join(' ')).toBe(spoken);
  });

  it('wraps a chunk to at most two lines', () => {
    const words = splitWords(
      'That choice became the company Keep the next one in FocusStack extra filler words here',
    );
    const chunks = chunkSpokenLine(words);
    for (const chunk of chunks) {
      expect(wrapChunkLines(chunk).length).toBeLessThanOrEqual(2);
    }
  });
});

describe('karaoke ASS', () => {
  const words = [
    {word: 'They', start: 0.1, end: 0.3},
    {word: 'had', start: 0.3, end: 0.45},
    {word: 'one', start: 0.45, end: 0.6},
    {word: 'weekend.', start: 0.6, end: 1.1},
    {word: 'No', start: 1.2, end: 1.35},
    {word: 'spare', start: 1.35, end: 1.6},
    {word: 'rooms.', start: 1.6, end: 2.1},
  ];

  it('chunks timestamped words on sentence ends', () => {
    const chunks = chunkTimestampedWords(words);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].text).toBe('They had one weekend.');
    expect(chunks[1].text).toBe('No spare rooms.');
  });

  it('emits PlayRes 1080×1920 Alignment 2 MarginV 600 and never 1088', () => {
    const ass = buildKaraokeAss(words);
    expect(ass).toContain('PlayResX: 1080');
    expect(ass).toContain('PlayResY: 1920');
    expect(ass).toContain(',2,140,140,600,1');
    expect(ass).not.toMatch(/(?<![\d])1088(?![\d])/);
    expect(ass).toContain('\\c&H4AE1FF&\\fs71');
    expect(ass).toContain('Dialogue:');
    expect(assTime(1.234)).toBe('0:00:01.23');
  });

  it('keeps the full chunk visible while highlighting one word', () => {
    const ass = buildKaraokeAss(words);
    expect(ass).toContain('They');
    expect(ass).toContain('weekend.');
    const dialogues = ass.split('\n').filter((l) => l.startsWith('Dialogue:'));
    expect(dialogues.length).toBe(words.length);
  });
});
