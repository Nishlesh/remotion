/**
 * Spoken line vo-08 → scene file.
 * "April 10th, 2008. They opened it to everyone. Three twenty-somethings. No outside investment."
 * One still for the whole scene: empty table.
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's08';
export const VOICEOVER_LINE_ID = 'vo-08';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene08Opened: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
