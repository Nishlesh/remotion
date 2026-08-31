/**
 * Spoken line vo-06 → scene file.
 * "One page. One line. Then another."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {quietHourSpec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's06';
export const VOICEOVER_LINE_ID = 'vo-06';
export const defaultProps = sceneSpecToProps(quietHourSpec, SCENE_ID);

export const Scene06OnePage: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
