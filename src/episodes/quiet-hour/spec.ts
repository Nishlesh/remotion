import raw from './episode.json';
import {parseEpisode} from '../../engine/episodeJson';

export const quietHourSpec = parseEpisode(raw);
