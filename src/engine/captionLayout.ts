import {
  CAPTION_INACTIVE_SIZE,
  CAPTION_MAX_CHUNK_WORDS,
  CAPTION_MAX_LINE_WIDTH,
  CAPTION_STROKE_PX,
} from './constants';
import {montserratBlack} from './fonts';

export const splitWords = (text: string): string[] =>
  text.trim().split(/\s+/).filter(Boolean);

const estimateWidth = (text: string, fontSize: number): number => {
  let units = 0;
  for (const char of text) {
    if (char === ' ') {
      units += 0.33;
    } else if (/[mwMW]/.test(char)) {
      units += 0.92;
    } else if (/[ilI.,:'!]/.test(char)) {
      units += 0.32;
    } else if (char === char.toUpperCase() && /[A-Z]/.test(char)) {
      units += 0.74;
    } else {
      units += 0.62;
    }
  }
  return units * fontSize;
};

let measureCtx: CanvasRenderingContext2D | null = null;

const getMeasureCtx = (): CanvasRenderingContext2D | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  if (measureCtx) {
    return measureCtx;
  }
  const canvas = document.createElement('canvas');
  measureCtx = canvas.getContext('2d');
  return measureCtx;
};

export const measureCaptionText = (text: string): number => {
  const ctx = getMeasureCtx();
  if (!ctx) {
    return estimateWidth(text, CAPTION_INACTIVE_SIZE);
  }
  ctx.font = `900 ${CAPTION_INACTIVE_SIZE}px ${montserratBlack}`;
  return ctx.measureText(text).width;
};

/** Visual width of one word at 68px Black, including 8px centered stroke. */
export const measureCaptionWord = (word: string): number =>
  measureCaptionText(word) + CAPTION_STROKE_PX;

export const measureCaptionSpace = (): number => measureCaptionText(' ');

export const lineVisualWidth = (words: string[]): number => {
  if (words.length === 0) {
    return 0;
  }
  const space = measureCaptionSpace();
  return (
    words.reduce((sum, word) => sum + measureCaptionWord(word), 0) +
    space * (words.length - 1)
  );
};

const canFitOnLine = (line: string[], word: string): boolean =>
  lineVisualWidth([...line, word]) <= CAPTION_MAX_LINE_WIDTH;

/**
 * Wrap a chunk to at most 2 lines using ~800px at 68px Black + 8px stroke.
 */
export const wrapChunkLines = (words: string[]): string[][] => {
  const lines: string[][] = [[]];
  for (const word of words) {
    const line = lines[lines.length - 1];
    if (line.length === 0) {
      line.push(word);
      continue;
    }
    if (canFitOnLine(line, word)) {
      line.push(word);
      continue;
    }
    if (lines.length === 1) {
      lines.push([word]);
      continue;
    }
    line.push(word);
  }
  return lines.filter((line) => line.length > 0);
};

const SENTENCE_END = /[.!?]$/;

export const isSentenceFinalWord = (word: string): boolean =>
  SENTENCE_END.test(word.trim());

/**
 * True when adding `word` would force a third visual line at 68px Black.
 * wrapChunkLines dumps overflow onto line 2, so we detect that case here.
 */
export const wouldOverflowTwoLines = (
  chunk: string[],
  word: string,
): boolean => {
  if (chunk.length === 0) {
    return false;
  }
  const lines = wrapChunkLines(chunk);
  if (lines.length <= 1) {
    return false;
  }
  return !canFitOnLine(lines[1], word);
};

/**
 * Split spoken words into karaoke chunks.
 * - Do not rewrite words.
 * - Sentence-final .!? ends a chunk.
 * - Max two wrapped lines per chunk (~800px at 68px Black).
 * - Soft 3–6 word preference when a sentence is long and still fits.
 */
export const chunkSpokenLine = (words: string[]): string[][] => {
  if (words.length === 0) {
    return [];
  }

  const chunks: string[][] = [];
  let chunk: string[] = [];

  const flush = () => {
    if (chunk.length === 0) {
      return;
    }
    chunks.push(chunk);
    chunk = [];
  };

  for (const word of words) {
    if (wouldOverflowTwoLines(chunk, word)) {
      flush();
    } else if (
      chunk.length >= CAPTION_MAX_CHUNK_WORDS &&
      !isSentenceFinalWord(word)
    ) {
      flush();
    }

    chunk.push(word);

    if (isSentenceFinalWord(word)) {
      flush();
    }
  }

  flush();
  return chunks;
};

export const splitAndChunkSpokenText = (text: string): string[][] =>
  chunkSpokenLine(splitWords(text));

export const locateWord = (
  chunks: string[][],
  globalIndex: number,
): {chunkIndex: number; wordInChunk: number} => {
  let remaining = Math.max(0, globalIndex);
  for (let i = 0; i < chunks.length; i++) {
    if (remaining < chunks[i].length) {
      return {chunkIndex: i, wordInChunk: remaining};
    }
    remaining -= chunks[i].length;
  }
  const last = Math.max(0, chunks.length - 1);
  return {
    chunkIndex: last,
    wordInChunk: Math.max(0, (chunks[last]?.length ?? 1) - 1),
  };
};
