/**
 * Spoken line vo-02 → scene file.
 * "A desk. A window. The city still awake."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {quietHourSpec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's02';
export const VOICEOVER_LINE_ID = 'vo-02';
export const defaultProps = sceneSpecToProps(quietHourSpec, SCENE_ID);

export const Scene02DeskWindow: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
