import React from 'react';
import {getScene, SceneFrame} from '../../../engine';
import type {SceneProps} from '../../../engine';
import {github2008Spec} from '../spec';

/** Shared renderer for this episode's spoken-line files. Captions off for Caption Agent. */
export const SceneFromLine: React.FC<SceneProps> = (props) => {
  return (
    <SceneFrame
      spec={getScene(github2008Spec, props.sceneId)}
      {...props}
      captionsEnabled={false}
    />
  );
};
