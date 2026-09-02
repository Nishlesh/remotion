import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import type {GradeSpec} from './types';
import './fonts';

type LookEngineProps = {
  grade: GradeSpec;
  opacity?: number;
  children: React.ReactNode;
};

const warmOf = (grade: GradeSpec): number => grade.warm;
const grainOf = (grade: GradeSpec): number => grade.grain;

/**
 * Shared look wrapper. Grade, grain, and vignette are tunables.
 * Channel default is Magnates-style warm film; engine demos may stay cool/neutral.
 * Not a cloned 12fps FilmTreatment kit — no scanlines, gate-weave, or posterize.
 */
export const LookEngine: React.FC<LookEngineProps> = ({
  grade,
  opacity = 1,
  children,
}) => {
  const warm = warmOf(grade);
  const grain = grainOf(grade);

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

      {grade.cool > 0 ? (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(22, 42, 68, ${grade.cool})`,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {warm > 0 ? (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(148, 82, 36, ${warm})`,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          background:
            warm > 0
              ? 'radial-gradient(ellipse at 50% 24%, rgba(255, 196, 140, 0.10) 0%, transparent 54%)'
              : 'radial-gradient(ellipse at 50% 28%, rgba(170, 198, 224, 0.10) 0%, transparent 52%)',
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
        }}
      />

      {grain > 0 ? (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile('engine/film-grain.png')})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            opacity: Math.min(0.55, grain * 0.7),
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {grade.vignette > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 40%, transparent 38%, rgba(4, 6, 10, ${0.62 * grade.vignette}) 100%)`,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
