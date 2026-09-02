import type {ComponentType} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import type {EpisodeProps, SceneProps} from './schemas';
import type {EpisodeSpec} from './types';

export type SceneModule = {
  id: string;
  voiceoverLineId: string;
  compositionId: string;
  component: ComponentType<SceneProps>;
  defaultProps: SceneProps;
};

export type RegisteredEpisode = {
  spec: EpisodeSpec;
  scenes: SceneModule[];
  episodeProps: EpisodeProps;
};

export const calculateSceneMetadata: CalculateMetadataFunction<SceneProps> = ({
  props,
}) => ({
  durationInFrames: props.timing.durationInFrames,
});
