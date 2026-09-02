import {join} from 'node:path';
import {isFixture, readJson, readMeta, requireGate, resolveEpisodeDir, writeJson} from '../paths';
import {scriptSchema} from '../schema/episode';
import {synthesizeEpisode} from '../tts/synthesize';

export const audioStage = async (slug: string) => {
  if (!isFixture(slug)) {
    requireGate(slug, 'factApproved');
  }
  const dir = resolveEpisodeDir(slug);
  const script = scriptSchema.parse(readJson(join(dir, 'script.json')));
  const result = synthesizeEpisode(script);
  const meta = readMeta(slug);
  writeJson(join(dir, 'meta.json'), {...meta, status: 'audio'});
  return result;
};
