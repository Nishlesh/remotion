import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {
  fameTest,
  focusStackMustNotLead,
  spokenWordCount,
  validateCadence,
  validateCta,
  watchWithoutFocusStack,
} from '../copy/engine';
import {SCRIPT_PROMPT} from '../prompts/templates';
import {
  isFixture,
  readJson,
  readMeta,
  requireGate,
  resolveEpisodeDir,
  writeText,
} from '../paths';
import {scriptSchema, type ScriptDoc} from '../schema/episode';

export const scriptStage = async (slug: string): Promise<ScriptDoc> => {
  if (!isFixture(slug)) {
    requireGate(slug, 'factApproved');
  }
  const dir = resolveEpisodeDir(slug);
  const meta = readMeta(slug);
  writeText(join(dir, 'prompts', 'script.md'), SCRIPT_PROMPT);

  const existing = join(dir, 'script.json');
  if (existsSync(existing)) {
    const doc = scriptSchema.parse(readJson(existing));
    validateScript(doc, meta.kind === 'fixture');
    return doc;
  }

  throw new Error(
    `No script.json at ${existing}. Write the spoken script from FACT_APPROVED research using the copy engine. The factory will not invent one.`,
  );
};

export const validateScript = (doc: ScriptDoc, fixture: boolean): void => {
  const fame = fameTest({
    famousEntity: doc.famousEntity,
    leadsWith: 'product',
    foundersNamedInHook: false,
  });
  if (!fame.ok && !fixture) {
    throw new Error(fame.message);
  }
  const watch = watchWithoutFocusStack(true);
  if (!watch.ok) {
    throw new Error(watch.message);
  }
  const lead = focusStackMustNotLead(doc.spoken);
  if (!lead.ok) {
    throw new Error(lead.message);
  }
  const cadence = validateCadence(doc.spoken).filter((c) => !c.ok);
  if (cadence.length && !fixture) {
    throw new Error(cadence.map((c) => c.message).join('\n'));
  }
  const tokens = doc.famousEntity.split(/\s+/);
  const cta = validateCta(doc.cta, [...tokens, ...Object.values(doc.spine)]).filter(
    (c) => !c.ok,
  );
  if (cta.length && !fixture) {
    throw new Error(cta.map((c) => c.message).join('\n'));
  }
  if (spokenWordCount(doc.spoken) !== doc.spokenWordCount) {
    throw new Error('spokenWordCount does not match spoken text.');
  }
};
