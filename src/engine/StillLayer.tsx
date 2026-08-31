import React from 'react';
import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {PICTURE_WINDOW} from './constants';
import {parallaxOffset, type KenBurnsState} from './motion';
import type {StillLayer as StillLayerSpec} from './types';

type StillLayerProps = StillLayerSpec & {
  kenBurns: KenBurnsState;
  parallaxAmount: number;
};

export const StillLayer: React.FC<StillLayerProps> = ({
  src,
  x,
  y,
  scale,
  opacity,
  depth,
  blend = 'normal',
  invertParallax = false,
  shiftX = 0,
  width,
  height,
  fromFrame,
  toFrame,
  fadeInFrames = 0,
  fadeOutFrames = 0,
  objectPosition = 'center center',
  kenBurns,
  parallaxAmount,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const start = fromFrame ?? 0;
  const end = toFrame ?? durationInFrames;
  if (frame < start || frame >= end) {
    return null;
  }

  const local = frame - start;
  const span = Math.max(1, end - start);
  const fadeIn =
    fadeInFrames <= 0
      ? 1
      : interpolate(local, [0, fadeInFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
  const fadeOut =
    fadeOutFrames <= 0
      ? 1
      : interpolate(local, [span - fadeOutFrames, span], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  const offset = parallaxOffset(kenBurns, depth, parallaxAmount);
  const drift = interpolate(kenBurns.t, [0, 1], [0, shiftX]);
  const tx = x + (invertParallax ? -offset.x : offset.x) + drift;
  const ty = y + offset.y;
  const s = scale * offset.scale;
  const layerWidth = width ?? PICTURE_WINDOW.width;
  const layerHeight = height ?? PICTURE_WINDOW.height;

  return (
    <div
      style={{
        position: 'absolute',
        left: tx,
        top: ty,
        width: layerWidth,
        height: layerHeight,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: opacity * fadeIn * fadeOut,
        mixBlendMode: blend,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition,
          transform: `scale(${s})`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
};

/** Clip stills, plates, and OS lockups to the 1080×1200 picture window. */
export const PictureWindow: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: PICTURE_WINDOW.x,
        top: PICTURE_WINDOW.y,
        width: PICTURE_WINDOW.width,
        height: PICTURE_WINDOW.height,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};
