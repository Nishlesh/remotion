/**
 * Spoken line vo-07 → scene file.
 * "They let friends in that January. PJ Hyett became the third co-founder a month later."
 * Two beats, one line: email push then cups/chair pull.
 */
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's07';
export const VOICEOVER_LINE_ID = 'vo-07';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene07InviteOnly: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 96, 192], [1, 1.05, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const merged = {...defaultProps, ...props};

  return (
    <SceneFromLine
      {...merged}
      motion={{
        ...merged.motion,
        kenBurns: {
          ...merged.motion.kenBurns,
          startScale: scale,
          endScale: scale,
        },
      }}
    />
  );
};
