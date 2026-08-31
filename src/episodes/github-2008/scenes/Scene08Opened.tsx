/**
 * Spoken line vo-08 → scene file.
 * "April 10th, 2008. They opened it to everyone. Three twenty-somethings. No outside investment."
 * Four dissolves: G10 calendar → S18 door → S19 arch silhouettes → S20 empty table.
 */
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's08';
export const VOICEOVER_LINE_ID = 'vo-08';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene08Opened: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 66, 144, 192, 234], [1, 1.04, 1.03, 1.05, 1.02], {
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
