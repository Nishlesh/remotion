/**
 * Spoken line vo-07 → scene file.
 * "They let friends in that January. PJ Hyett became the third co-founder a month later."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's07';
export const VOICEOVER_LINE_ID = 'vo-07';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene07InviteOnly: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
