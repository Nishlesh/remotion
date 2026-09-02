import raw from './episode.json';
import {parseEpisode} from '../../engine/episodeJson';

export const whatsapp2009Spec = parseEpisode(raw);
