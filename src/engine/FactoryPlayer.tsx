import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import {SceneFrame} from './SceneFrame';
import {sceneSpecToProps} from './duration';
import type {EpisodeSpec} from './types';

type FactoryPlayerProps = {
  spec: EpisodeSpec;
};

/**
 * JSON-driven player for factory episodes. Captions stay off here —
 * karaoke is burned with ffmpeg ass after assemble.
 */
export const FactoryPlayer: React.FC<FactoryPlayerProps> = ({spec}) => {
  const vo = spec.audio?.voiceover;
  const bed = spec.audio?.bed;

  return (
    <AbsoluteFill style={{backgroundColor: '#07090d'}}>
      <Series>
        {spec.scenes.map((scene) => {
          const props = sceneSpecToProps(spec, scene.id);
          return (
            <Series.Sequence
              key={scene.id}
              durationInFrames={scene.durationInFrames}
              name={scene.id}
            >
              <SceneFrame
                spec={scene}
                {...props}
                captionsEnabled={false}
              />
            </Series.Sequence>
          );
        })}
      </Series>
      {vo ? <Audio src={staticFile(vo)} /> : null}
      {bed ? <Audio src={staticFile(bed)} volume={0.12} /> : null}
    </AbsoluteFill>
  );
};
