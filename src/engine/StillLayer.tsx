import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {HEIGHT, WIDTH} from './constants';
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
  kenBurns,
  parallaxAmount,
}) => {
  const offset = parallaxOffset(kenBurns, depth, parallaxAmount);
  const tx = x + offset.x;
  const ty = y + offset.y;
  const s = scale * offset.scale;

  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <Img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          width: WIDTH,
          height: HEIGHT,
          left: 0,
          top: 0,
          opacity,
          mixBlendMode: blend,
          transform: `translate(${tx}px, ${ty}px) scale(${s})`,
          transformOrigin: 'center center',
        }}
      />
    </AbsoluteFill>
  );
};
