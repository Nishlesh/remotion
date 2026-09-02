import React from 'react';
import {AbsoluteFill} from 'remotion';
import {
  CAPTION_ACTIVE_SIZE,
  CAPTION_ASCENT,
  CAPTION_BAND,
  CAPTION_BASELINE_Y,
  CAPTION_FILL_ACTIVE,
  CAPTION_FILL_INACTIVE,
  CAPTION_INACTIVE_SIZE,
  CAPTION_LINE_HEIGHT,
  CAPTION_STROKE,
  CAPTION_STROKE_PX,
  WIDTH,
} from './constants';
import {montserratBlack} from './fonts';
import {
  chunkSpokenLine,
  locateWord,
  measureCaptionSpace,
  splitWords,
  wrapChunkLines,
} from './captionLayout';
import {useKaraokeIndex} from './motion';

type CaptionBandProps = {
  /** Unused. Kept so existing episode JSON / SceneFrame props still typecheck. */
  kicker?: string;
  text: string;
  highlightBias: number;
};

type KaraokeWordProps = {
  word: string;
  active: boolean;
};

const KaraokeWord: React.FC<KaraokeWordProps> = ({word, active}) => {
  const fontSize = active ? CAPTION_ACTIVE_SIZE : CAPTION_INACTIVE_SIZE;
  const fill = active ? CAPTION_FILL_ACTIVE : CAPTION_FILL_INACTIVE;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: montserratBlack,
        fontWeight: 900,
        fontSize,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          color: CAPTION_STROKE,
          WebkitTextStroke: `${CAPTION_STROKE_PX}px ${CAPTION_STROKE}`,
          paintOrder: 'stroke fill',
          textShadow: '0px 4px 0 rgba(0,0,0,0.55)',
          whiteSpace: 'nowrap',
        }}
      >
        {word}
      </span>
      <span
        style={{
          position: 'relative',
          color: fill,
          WebkitTextStroke: '0px transparent',
          paintOrder: 'stroke fill',
          whiteSpace: 'nowrap',
        }}
      >
        {word}
      </span>
    </span>
  );
};

/**
 * Locked Karaoke Highlight captions.
 * Montserrat Black 900, 8px black stroke, active word #FFE14A at 71px.
 * Full chunk visible. Only the current word is yellow.
 */
export const CaptionBand: React.FC<CaptionBandProps> = ({
  text,
  highlightBias,
}) => {
  const words = splitWords(text);
  const chunks = chunkSpokenLine(words);
  const globalActive = useKaraokeIndex(words.length, highlightBias);
  const {chunkIndex, wordInChunk} = locateWord(chunks, globalActive);
  const chunk = chunks[chunkIndex] ?? [];
  const lines = wrapChunkLines(chunk);
  const blockTop =
    CAPTION_BASELINE_Y -
    CAPTION_ASCENT -
    Math.max(0, lines.length - 1) * CAPTION_LINE_HEIGHT;
  const wordGap = measureCaptionSpace();

  let wordOffset = 0;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: blockTop,
          left: CAPTION_BAND.left,
          width: WIDTH - CAPTION_BAND.left - CAPTION_BAND.right,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {lines.map((line, lineIndex) => {
          const lineStart = wordOffset;
          wordOffset += line.length;
          return (
            <div
              key={`line-${lineIndex}`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'center',
                alignItems: 'baseline',
                height: CAPTION_LINE_HEIGHT,
                gap: wordGap,
                width: '100%',
              }}
            >
              {line.map((word, i) => (
                <KaraokeWord
                  key={`${word}-${lineStart + i}`}
                  word={word}
                  active={lineStart + i === wordInChunk}
                />
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
