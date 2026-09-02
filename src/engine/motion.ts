import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {EntranceMotion, KenBurnsMotion} from './types';

/** Slow editorial Ken Burns. One transform for the whole still stack. */
export const useKenBurns = (config: KenBurnsMotion) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return {
    t,
    scale: interpolate(t, [0, 1], [config.startScale, config.endScale]),
    x: interpolate(t, [0, 1], [config.startX, config.endX]),
    y: interpolate(t, [0, 1], [config.startY, config.endY]),
  };
};

export type KenBurnsState = ReturnType<typeof useKenBurns>;

/**
 * Fake depth: layers with higher `depth` travel farther than the background.
 * This is code parallax, not After Effects.
 */
export const parallaxOffset = (
  kenBurns: KenBurnsState,
  depth: number,
  amount: number,
) => {
  const extra = 1 + depth * (amount / 48);
  return {
    x: kenBurns.x * extra,
    y: kenBurns.y * extra,
    scale: kenBurns.scale * (1 + depth * 0.018),
  };
};

export const useEntrance = (config: EntranceMotion) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({
    frame,
    fps,
    config: {
      damping: config.damping,
      mass: 0.9,
      stiffness: 70,
    },
  });

  return {
    opacity: interpolate(progress, [0, 1], [0.35, 1]),
    y: interpolate(progress, [0, 1], [18, 0]),
    scale: interpolate(progress, [0, 1], [1.025, 1]),
  };
};

export const useSceneFade = (fadeInFrames: number, fadeOutFrames: number) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, Math.max(1, fadeInFrames)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [
      Math.max(0, durationInFrames - fadeOutFrames),
      Math.max(1, durationInFrames),
    ],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  return Math.min(fadeIn, fadeOut);
};

/**
 * Karaoke word index from scene progress. `highlightBias` < 0.5 leads the
 * highlight; > 0.5 lags it. No TTS — pacing is derived from duration.
 */
export const useKaraokeIndex = (
  wordCount: number,
  highlightBias: number,
) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (wordCount <= 0) {
    return 0;
  }

  const leadIn = Math.min(12, Math.floor(durationInFrames * 0.08));
  const tail = Math.min(10, Math.floor(durationInFrames * 0.06));
  const bias = interpolate(highlightBias, [0, 1], [0.72, 1.18]);
  const t = interpolate(
    frame,
    [leadIn, Math.max(leadIn + 1, durationInFrames - tail)],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const progressed = Math.pow(t, bias);
  return Math.min(wordCount - 1, Math.floor(progressed * wordCount));
};
