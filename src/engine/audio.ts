import {getAudioDurationInSeconds} from '@remotion/media-utils';
import type {CalculateMetadataFunction} from 'remotion';
import {staticFile} from 'remotion';
import {FPS} from './constants';
import {episodeDurationInFrames} from './duration';
import type {EpisodeProps} from './schemas';
import type {EpisodeSpec} from './types';

export const calculateEpisodeMetadata = (
  spec: EpisodeSpec,
): CalculateMetadataFunction<EpisodeProps> => {
  return async () => {
    const fallback = {durationInFrames: episodeDurationInFrames(spec)};
    const vo = spec.audio?.voiceover;
    if (!vo) {
      return fallback;
    }
    try {
      const seconds = await getAudioDurationInSeconds(staticFile(vo));
      return {durationInFrames: Math.max(1, Math.round(seconds * FPS))};
    } catch {
      return fallback;
    }
  };
};
