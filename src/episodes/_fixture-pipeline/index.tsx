import {makeJsonEpisode} from '../../engine/JsonEpisode';
import {fixturePipelineSpec} from './spec';

const built = makeJsonEpisode(fixturePipelineSpec);

export const fixturePipelineSpecExport = fixturePipelineSpec;
export const fixturePipelineScenes = built.scenes;
export const fixturePipelineEpisodeProps = built.episodeProps;
export const fixturePipelineDurationInFrames = built.durationInFrames;
export const FixturePipelineEpisode = built.Episode;
export const fixturePipelineEpisodeSchema = built.episodeSchema;
export {fixturePipelineSpec};
