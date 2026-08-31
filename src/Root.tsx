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
import {
  Github2008Episode,
  github2008DurationInFrames,
  github2008EpisodeProps,
  github2008EpisodeSchema,
  github2008Scenes,
  github2008Spec,
} from './episodes/github-2008';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Quiet-Hour">
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
      <Folder name="Github-2008">
        <Composition
          id={github2008Spec.compositionId}
          component={Github2008Episode}
          schema={github2008EpisodeSchema}
          defaultProps={github2008EpisodeProps}
          durationInFrames={github2008DurationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          calculateMetadata={calculateEpisodeMetadata(github2008Spec)}
        />
        {github2008Scenes.map((scene) => (
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
