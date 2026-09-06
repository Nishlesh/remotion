/**
 * Spoken line vo-02 → scene file.
 * "Chris Wanstrath made the first commit. October 19th, 2007."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's02';
export const VOICEOVER_LINE_ID = 'vo-02';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene02FirstCommit: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
