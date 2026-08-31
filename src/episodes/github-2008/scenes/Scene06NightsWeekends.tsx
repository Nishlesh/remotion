/**
 * Spoken line vo-06 → scene file.
 * "Three months of nights and weekends. Design and pricing on Saturday."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's06';
export const VOICEOVER_LINE_ID = 'vo-06';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene06NightsWeekends: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
