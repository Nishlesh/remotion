import React from 'react';
import {Composition, Folder} from 'remotion';
import {
  FPS,
  HEIGHT,
  WIDTH,
  calculateEpisodeMetadata,
  calculateFactoryActiveMetadata,
  calculateSceneMetadata,
  FactoryPlayer,
  sceneSchema,
} from './engine';
import type {EpisodeSpec} from './engine/types';
import {episodeJsonSchema} from './engine/episodeJson';
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
import {
  FixturePipelineEpisode,
  fixturePipelineDurationInFrames,
  fixturePipelineEpisodeProps,
  fixturePipelineEpisodeSchema,
  fixturePipelineScenes,
  fixturePipelineSpec,
} from './episodes/_fixture-pipeline';
import {z} from 'zod';

const factoryActiveSchema = z.object({
  spec: episodeJsonSchema,
});

type FactoryActiveProps = {spec: EpisodeSpec};

const FactoryActive: React.FC<FactoryActiveProps> = ({spec}) => {
  return <FactoryPlayer spec={spec} />;
};

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
      <Folder name="Factory">
        <Composition
          id={fixturePipelineSpec.compositionId}
          component={FixturePipelineEpisode}
          schema={fixturePipelineEpisodeSchema}
          defaultProps={fixturePipelineEpisodeProps}
          durationInFrames={fixturePipelineDurationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          calculateMetadata={calculateEpisodeMetadata(fixturePipelineSpec)}
        />
        {fixturePipelineScenes.map((scene) => (
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
        <Composition
          id="FactoryActive"
          component={FactoryActive}
          schema={factoryActiveSchema}
          defaultProps={{spec: fixturePipelineSpec}}
          durationInFrames={fixturePipelineDurationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          calculateMetadata={calculateFactoryActiveMetadata}
        />
      </Folder>
    </>
  );
};
