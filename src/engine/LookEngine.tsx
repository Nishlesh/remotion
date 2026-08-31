import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {GradeSpec} from './types';
import './fonts';

type LookEngineProps = {
  grade: GradeSpec;
  opacity?: number;
  children: React.ReactNode;
};

/**
 * Shared look wrapper. Every scene imports this so grade, vignette, and
 * caption-safe darkness are inherited — write once, inherit everywhere.
 *
 * This is a cinematic editorial stills look: cool/neutral grade, optional
 * vignette, slow motion living in the still stack. It is NOT a vintage
 * film-treatment / 12fps / grain look.
 */
export const LookEngine: React.FC<LookEngineProps> = ({
  grade,
  opacity = 1,
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07090d',
        opacity,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          filter: `contrast(${grade.contrast}) saturate(${grade.saturation}) brightness(${grade.brightness})`,
        }}
      >
        {children}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          backgroundColor: `rgba(22, 42, 68, ${grade.cool})`,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 28%, rgba(170, 198, 224, 0.10) 0%, transparent 52%)',
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
        }}
      />

      {grade.vignette > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 40%, transparent 38%, rgba(4, 6, 10, ${0.62 * grade.vignette}) 100%)`,
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {/* Caption-safe wash over y=1200–1440 so type always sits on darkness. */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, transparent 1080px, rgba(6, 8, 12, 0.42) 1200px, rgba(6, 8, 12, 0.58) 1320px, rgba(6, 8, 12, 0.50) 1440px, rgba(6, 8, 12, 0.22) 1580px, transparent 1760px)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
