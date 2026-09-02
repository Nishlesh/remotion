import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import type {EpisodeSpec} from './types';
import type {SceneModule} from './registry';

type EpisodeTimelineProps = {
  episode: EpisodeSpec;
  scenes: SceneModule[];
};

/**
 * Root timeline: drop finished scene files here in VO order.
 * Duration comes from JSON (and optional locked VO later).
 */
export const EpisodeTimeline: React.FC<EpisodeTimelineProps> = ({
  episode,
  scenes,
}) => {
  const vo = episode.audio?.voiceover;
  const bed = episode.audio?.bed;

  return (
    <AbsoluteFill style={{backgroundColor: '#07090d'}}>
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.defaultProps.timing.durationInFrames}
            name={scene.id}
          >
            <scene.component {...scene.defaultProps} />
          </Series.Sequence>
        ))}
      </Series>
      {vo ? <Audio src={staticFile(vo)} /> : null}
      {bed ? <Audio src={staticFile(bed)} volume={0.12} /> : null}
    </AbsoluteFill>
  );
};
