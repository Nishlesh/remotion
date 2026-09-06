import {
  ASS_ACTIVE_COLOR,
  ASS_ALIGNMENT,
  ASS_FONT_NAME,
  ASS_INACTIVE_COLOR,
  ASS_MARGIN_L,
  ASS_MARGIN_R,
  ASS_MARGIN_V,
  ASS_OUTLINE_COLOR,
  ASS_PLAY_RES_X,
  ASS_PLAY_RES_Y,
  CAPTION_ACTIVE_SIZE,
  CAPTION_INACTIVE_SIZE,
  CAPTION_STROKE_PX,
  HEIGHT,
  WIDTH,
} from '../../engine/constants';
import {
  chunkSpokenLine,
  isSentenceFinalWord,
  splitWords,
  wrapChunkLines,
} from '../../engine/captionLayout';
import type {WordStamp} from '../schema/episode';

export type KaraokeChunk = {
  words: WordStamp[];
  text: string;
};

export {chunkSpokenLine, splitWords, wrapChunkLines, isSentenceFinalWord};

export const wordsFromSpoken = (text: string): string[] => splitWords(text);

/**
 * Chunk timestamped words with the same rules as CaptionBand:
 * sentence-final .!? ends a chunk; max two wrapped lines; do not rewrite.
 */
export const chunkTimestampedWords = (words: WordStamp[]): KaraokeChunk[] => {
  const groups = chunkSpokenLine(words.map((w) => w.word));
  const chunks: KaraokeChunk[] = [];
  let offset = 0;
  for (const group of groups) {
    const slice = words.slice(offset, offset + group.length);
    offset += group.length;
    chunks.push({
      words: slice,
      text: slice.map((w) => w.word).join(' '),
    });
  }
  return chunks;
};

export const assTime = (seconds: number): string => {
  const clamped = Math.max(0, seconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  const whole = Math.floor(s);
  const cs = Math.min(99, Math.round((s - whole) * 100));
  const pad = (n: number, w: number) => String(n).padStart(w, '0');
  return `${h}:${pad(m, 2)}:${pad(whole, 2)}.${pad(cs, 2)}`;
};

export const escapeAss = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');

const styleWord = (word: string, active: boolean): string => {
  const safe = escapeAss(word);
  if (active) {
    return `{\\c${ASS_ACTIVE_COLOR}\\fs${CAPTION_ACTIVE_SIZE}}${safe}{\\c${ASS_INACTIVE_COLOR}\\fs${CAPTION_INACTIVE_SIZE}}`;
  }
  return safe;
};

export const chunkDialogueText = (chunk: KaraokeChunk, activeIndex: number): string => {
  return chunk.words
    .map((word, i) => styleWord(word.word, i === activeIndex))
    .join(' ');
};

export const buildAssHeader = (): string => {
  return [
    '[Script Info]',
    'Title: Before It Was Famous Karaoke Highlight',
    'ScriptType: v4.00+',
    'WrapStyle: 2',
    'ScaledBorderAndShadow: yes',
    `PlayResX: ${ASS_PLAY_RES_X}`,
    `PlayResY: ${ASS_PLAY_RES_Y}`,
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Karaoke,${ASS_FONT_NAME},${CAPTION_INACTIVE_SIZE},&H00FFFFFF,&H00FFFFFF,${ASS_OUTLINE_COLOR},&H00000000,-1,0,0,0,100,100,0,0,1,${CAPTION_STROKE_PX},0,${ASS_ALIGNMENT},${ASS_MARGIN_L},${ASS_MARGIN_R},${ASS_MARGIN_V},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ].join('\n');
};

/**
 * One ASS dialogue per active word. Full chunk stays visible.
 * Alignment 2 + MarginV 600 → last-line baseline ≈ y=1320 on 1920 canvas.
 */
export const buildAssEvents = (chunks: KaraokeChunk[]): string[] => {
  const lines: string[] = [];
  for (const chunk of chunks) {
    if (chunk.words.length === 0) {
      continue;
    }
    const chunkEnd = chunk.words[chunk.words.length - 1].end;
    for (let i = 0; i < chunk.words.length; i++) {
      const start = chunk.words[i].start;
      const end = i + 1 < chunk.words.length ? chunk.words[i + 1].start : chunkEnd;
      if (end <= start) {
        continue;
      }
      const text = chunkDialogueText(chunk, i);
      lines.push(
        `Dialogue: 0,${assTime(start)},${assTime(end)},Karaoke,,0,0,0,,${text}`,
      );
    }
  }
  return lines;
};

export const buildKaraokeAss = (words: WordStamp[]): string => {
  const chunks = chunkTimestampedWords(words);
  return `${buildAssHeader()}\n${buildAssEvents(chunks).join('\n')}\n`;
};

export const flattenTimestamps = (lines: {words: WordStamp[]}[]): WordStamp[] =>
  lines.flatMap((line) => line.words);

export const assertPlayRes = (ass: string): void => {
  if (!ass.includes(`PlayResX: ${WIDTH}`) || !ass.includes(`PlayResY: ${HEIGHT}`)) {
    throw new Error('ASS PlayRes must be 1080×1920');
  }
  if (ass.includes('1088')) {
    throw new Error('ASS must never target 1088 width');
  }
};
