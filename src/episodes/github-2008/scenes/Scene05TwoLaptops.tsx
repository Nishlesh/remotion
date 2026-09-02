/**
 * Spoken line vo-05 → scene file.
 * "Tom built Grit and the interface. Chris built the Rails app."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's05';
export const VOICEOVER_LINE_ID = 'vo-05';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene05TwoLaptops: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
