/**
 * Spoken line vo-01 → scene file.
 * "GitHub started at 10:24 on a Friday night."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's01';
export const VOICEOVER_LINE_ID = 'vo-01';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene01FridayNight: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
