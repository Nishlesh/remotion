import React from 'react';
import {getScene, SceneFrame} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {quietHourSpec} from '../spec';

/** Shared renderer for this episode's spoken-line files. */
export const SceneFromLine: React.FC<SceneProps> = (props) => {
  return <SceneFrame spec={getScene(quietHourSpec, props.sceneId)} {...props} />;
};
