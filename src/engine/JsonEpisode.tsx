import React from 'react';
import {SceneFrame} from './SceneFrame';
import {episodeDurationInFrames, getScene, sceneSpecToProps} from './duration';
import {EpisodeTimeline} from './EpisodeTimeline';
import type {SceneModule} from './registry';
import {episodeSchema, type EpisodeProps, type SceneProps} from './schemas';
import type {EpisodeSpec} from './types';

/**
 * JSON-driven episode. Factory episodes use this instead of one TSX file
 * per spoken line. Existing Github2008 / QuietHour scene files stay as-is.
 */
export const JsonSceneFromSpec: React.FC<
  SceneProps & {episode: EpisodeSpec}
> = ({episode, ...props}) => {
  return (
    <SceneFrame
      spec={getScene(episode, props.sceneId)}
      {...props}
      captionsEnabled={episode.captionsEnabled !== false}
    />
  );
};

export const makeJsonScenes = (episode: EpisodeSpec): SceneModule[] => {
  return episode.scenes.map((scene, index) => {
    const n = String(index + 1).padStart(2, '0');
    const defaultProps = sceneSpecToProps(episode, scene.id);
    const Scene: React.FC<SceneProps> = (props) => (
      <JsonSceneFromSpec episode={episode} {...defaultProps} {...props} />
    );
    Scene.displayName = `${episode.compositionId}-${n}`;
    return {
      id: scene.id,
      voiceoverLineId: scene.voiceoverLineId,
      compositionId: `${episode.compositionId}-${n}`,
      component: Scene,
      defaultProps,
    };
  });
};

export const makeJsonEpisode = (episode: EpisodeSpec) => {
  const scenes = makeJsonScenes(episode);
  const Episode: React.FC<EpisodeProps> = ({episodeId, title}) => (
    <EpisodeTimeline
      episode={{...episode, id: episodeId, title}}
      scenes={scenes}
    />
  );
  Episode.displayName = episode.compositionId;

  return {
    spec: episode,
    scenes,
    Episode,
    durationInFrames: episodeDurationInFrames(episode),
    episodeProps: {
      episodeId: episode.id,
      title: episode.title,
    } satisfies EpisodeProps,
    episodeSchema,
  };
};
