import {makeJsonEpisode} from '../../engine/JsonEpisode';
import {whatsapp2009Spec} from './spec';

const built = makeJsonEpisode(whatsapp2009Spec);

export const whatsapp2009Scenes = built.scenes;
export const whatsapp2009EpisodeProps = built.episodeProps;
export const whatsapp2009DurationInFrames = built.durationInFrames;
export const WhatsApp2009Episode = built.Episode;
export const whatsapp2009EpisodeSchema = built.episodeSchema;
export {whatsapp2009Spec};
