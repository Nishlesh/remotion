import raw from './episode.json';
import {parseEpisode} from '../../engine/episodeJson';

export const github2008Spec = parseEpisode(raw);
