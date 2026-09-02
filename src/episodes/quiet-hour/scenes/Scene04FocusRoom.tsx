/**
 * Spoken line vo-04 → scene file.
 * "Focus is not a personality. It is a room you enter."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {quietHourSpec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's04';
export const VOICEOVER_LINE_ID = 'vo-04';
export const defaultProps = sceneSpecToProps(quietHourSpec, SCENE_ID);

export const Scene04FocusRoom: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
