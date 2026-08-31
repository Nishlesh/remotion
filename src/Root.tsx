import React from 'react';
import {Composition, Folder} from 'remotion';
import {
  FPS,
  HEIGHT,
  WIDTH,
  calculateEpisodeMetadata,
  calculateSceneMetadata,
  sceneSchema,
} from './engine';
import {
  QuietHourEpisode,
  quietHourDurationInFrames,
  quietHourEpisodeProps,
  quietHourEpisodeSchema,
  quietHourScenes,
  quietHourSpec,
} from './episodes/quiet-hour';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name={quietHourSpec.title}>
        <Composition
          id={quietHourSpec.compositionId}
          component={QuietHourEpisode}
          schema={quietHourEpisodeSchema}
          defaultProps={quietHourEpisodeProps}
          durationInFrames={quietHourDurationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          calculateMetadata={calculateEpisodeMetadata(quietHourSpec)}
        />
        {quietHourScenes.map((scene) => (
          <Composition
            key={scene.compositionId}
            id={scene.compositionId}
            component={scene.component}
            schema={sceneSchema}
            defaultProps={scene.defaultProps}
            durationInFrames={scene.defaultProps.timing.durationInFrames}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            calculateMetadata={calculateSceneMetadata}
          />
        ))}
      </Folder>
    </>
  );
};
