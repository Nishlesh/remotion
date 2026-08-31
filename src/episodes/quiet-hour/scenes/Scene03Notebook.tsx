/**
 * Spoken line vo-03 → scene file.
 * "You sit with a notebook and nothing to prove."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {quietHourSpec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's03';
export const VOICEOVER_LINE_ID = 'vo-03';
export const defaultProps = sceneSpecToProps(quietHourSpec, SCENE_ID);

export const Scene03Notebook: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
