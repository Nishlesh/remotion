/**
 * Spoken line vo-05 → scene file.
 * "The light stays cool. The noise stays outside."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {quietHourSpec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's05';
export const VOICEOVER_LINE_ID = 'vo-05';
export const defaultProps = sceneSpecToProps(quietHourSpec, SCENE_ID);

export const Scene05CoolLight: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
