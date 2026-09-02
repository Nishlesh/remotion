import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {RESEARCH_PROMPT} from '../prompts/templates';
import {ensureEpisodeDir, readJson, readMeta, resolveEpisodeDir, writeJson, writeText} from '../paths';
import {researchSchema, type ResearchDoc} from '../schema/episode';

export const research = async (slug: string): Promise<ResearchDoc> => {
  const dir = ensureEpisodeDir(slug);
  const meta = readMeta(slug);
  writeText(join(dir, 'prompts', 'research.md'), RESEARCH_PROMPT);

  const existing = join(dir, 'research.json');
  if (existsSync(existing)) {
    return researchSchema.parse(readJson(existing));
  }

  const doc = researchSchema.parse({
    slug,
    famousEntity: meta.famousEntity,
    promptPath: 'prompts/research.md',
    sources: [],
    facts: [],
    unknown: [
      'No sources attached yet. Do not invent facts. Fill research.json from primary/secondary reporting, then create FACT_APPROVED.',
    ],
    inventedFactsForbidden: true,
  });

  writeJson(join(resolveEpisodeDir(slug), 'research.json'), {
    ...doc,
    operatorNote:
      'FACT_APPROVED is a hard human file gate after this spine is sourced. The script stage will refuse without it.',
  });
  writeJson(join(dir, 'meta.json'), {...meta, status: 'research'});
  return doc;
};
