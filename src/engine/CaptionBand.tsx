import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAPTION_BAND} from './constants';
import {bodyFont, displayFont} from './fonts';
import {useKaraokeIndex} from './motion';

type CaptionBandProps = {
  kicker: string;
  text: string;
  highlightBias: number;
  scale?: number;
};

const splitWords = (text: string): string[] =>
  text.trim().split(/\s+/).filter(Boolean);

/**
 * Editorial Karaoke Highlight captions. Live strictly in y=1200–1440.
 * Not meme type: no stroke, no all-caps shout, no impact shadow.
 */
export const CaptionBand: React.FC<CaptionBandProps> = ({
  kicker,
  text,
  highlightBias,
  scale = 1,
}) => {
  const words = splitWords(text);
  const active = useKaraokeIndex(words.length, highlightBias);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: CAPTION_BAND.top,
          left: CAPTION_BAND.left,
          right: CAPTION_BAND.right,
          height: CAPTION_BAND.bottom - CAPTION_BAND.top,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transform: `scale(${scale})`,
          transformOrigin: 'left center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 22,
          }}
        >
          <div
            style={{
              width: 2,
              backgroundColor: 'rgba(214, 224, 234, 0.55)',
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
          <div style={{minWidth: 0, flex: 1}}>
            {kicker ? (
              <div
                style={{
                  fontFamily: displayFont,
                  fontSize: 28,
                  letterSpacing: 6,
                  color: 'rgba(198, 210, 222, 0.72)',
                  marginBottom: 14,
                  lineHeight: 1,
                }}
              >
                {kicker}
              </div>
            ) : null}
            <div
              style={{
                fontFamily: bodyFont,
                fontSize: 46,
                fontWeight: 500,
                lineHeight: 1.18,
                letterSpacing: -0.4,
                color: '#E8EEF4',
              }}
            >
              {words.map((word, index) => {
                const spoken = index <= active;
                const current = index === active;
                return (
                  <span
                    key={`${word}-${index}`}
                    style={{
                      display: 'inline',
                      color: spoken ? '#F3F1EC' : 'rgba(186, 196, 206, 0.48)',
                      fontWeight: current ? 700 : 500,
                      borderBottom: current
                        ? '2px solid rgba(243, 241, 236, 0.85)'
                        : '2px solid transparent',
                      marginRight: 10,
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
