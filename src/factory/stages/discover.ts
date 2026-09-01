import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {DISCOVER_PROMPT} from '../prompts/templates';
import {discoverySchema, type DiscoveryDoc} from '../schema/episode';
import {ensureEpisodeDir, readJson, readMeta, writeJson, writeText} from '../paths';

export const discover = async (slug: string, query?: string): Promise<DiscoveryDoc> => {
  const dir = ensureEpisodeDir(slug);
  const meta = readMeta(slug);
  writeText(join(dir, 'prompts', 'discover.md'), DISCOVER_PROMPT);

  const existing = join(dir, 'discovery.json');
  if (existsSync(existing)) {
    return discoverySchema.parse(readJson(existing));
  }

  const doc = discoverySchema.parse({
    slug,
    createdAt: new Date().toISOString(),
    query: query ?? meta.famousEntity,
    promptPath: 'prompts/discover.md',
    candidates: [],
    rejected: [],
  });

  writeJson(join(dir, 'discovery.json'), {
    ...doc,
    operatorNote:
      'Structured stub. Add candidates only with two reliable sources. Do not invent facts. Would someone watch this if FocusStack did not exist? If no, reject.',
  });
  writeJson(join(dir, 'meta.json'), {...meta, status: 'discover'});
  return doc;
};
