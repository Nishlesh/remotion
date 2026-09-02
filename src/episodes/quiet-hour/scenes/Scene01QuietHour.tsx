/**
 * Spoken line vo-01 → scene file.
 * "There is an hour most people never keep."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {quietHourSpec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's01';
export const VOICEOVER_LINE_ID = 'vo-01';
export const defaultProps = sceneSpecToProps(quietHourSpec, SCENE_ID);

export const Scene01QuietHour: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
