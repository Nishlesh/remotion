/**
 * Spoken line vo-07 → scene file.
 * "The quiet hour is still there. You only have to keep it."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {quietHourSpec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's07';
export const VOICEOVER_LINE_ID = 'vo-07';
export const defaultProps = sceneSpecToProps(quietHourSpec, SCENE_ID);

export const Scene07KeepIt: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
