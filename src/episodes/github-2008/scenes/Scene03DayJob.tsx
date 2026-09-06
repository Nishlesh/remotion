/**
 * Spoken line vo-03 → scene file.
 * "Tom Preston-Werner still had a day job. Tools developer at Powerset. Full time."
 */
import React from 'react';
import {sceneSpecToProps} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';
import {SceneFromLine} from './SceneFromLine';

export const SCENE_ID = 's03';
export const VOICEOVER_LINE_ID = 'vo-03';
export const defaultProps = sceneSpecToProps(github2008Spec, SCENE_ID);

export const Scene03DayJob: React.FC<SceneProps> = (props) => (
  <SceneFromLine {...defaultProps} {...props} />
);
