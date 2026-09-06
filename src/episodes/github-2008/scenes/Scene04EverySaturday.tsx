/**
 * Spoken line vo-04 → scene file.
 * "Chris was consulting. They met every Saturday."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's04';
export const VOICEOVER_LINE_ID = 'vo-04';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene04EverySaturday: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
