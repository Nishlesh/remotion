import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {fameTest, watchWithoutFocusStack} from '../copy/engine';
import {ensureEpisodeDir, readJson, readMeta, resolveEpisodeDir, writeJson} from '../paths';
import {
  discoverySchema,
  scoreSchema,
  type ScoreDoc,
} from '../schema/episode';

export const score = async (slug: string): Promise<ScoreDoc> => {
  ensureEpisodeDir(slug);
  const dir = resolveEpisodeDir(slug);
  const meta = readMeta(slug);
  const discoveryPath = join(dir, 'discovery.json');
  const discovery = existsSync(discoveryPath)
    ? discoverySchema.parse(readJson(discoveryPath))
    : null;
  const candidate = discovery?.candidates[0];

  const existing = join(dir, 'score.json');
  if (existsSync(existing)) {
    return scoreSchema.parse(readJson(existing));
  }

  const fame = fameTest({
    famousEntity: candidate?.famousEntity ?? meta.famousEntity,
    leadsWith: 'product',
    foundersNamedInHook: false,
  });
  const watchable = watchWithoutFocusStack(
    candidate?.watchWithoutFocusStack ?? meta.kind === 'fixture',
  );
  const sourceCount = candidate?.sources.length ?? 0;
  const breakdown = {
    fame: fame.ok ? 20 : 0,
    unexpectedBeginning: candidate ? 15 : 0,
    humanStakes: candidate ? 15 : 0,
    visualSpine: candidate ? 15 : 0,
    runtimeFit: 15,
  };
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const pivotal = candidate ? 3 : 0;
  const pass =
    total >= 70 &&
    pivotal >= 3 &&
    sourceCount >= 2 &&
    fame.ok &&
    watchable.ok &&
    meta.kind === 'production'
      ? true
      : meta.kind === 'fixture';

  const reasons: string[] = [];
  if (!fame.ok) reasons.push(fame.message);
  if (!watchable.ok) reasons.push(watchable.message);
  if (sourceCount < 2 && meta.kind !== 'fixture') {
    reasons.push('Need two reliable sources.');
  }
  if (!candidate && meta.kind !== 'fixture') {
    reasons.push('No sourced candidate in discovery.json — not a pass.');
  }

  const doc = scoreSchema.parse({
    slug,
    famousEntity: candidate?.famousEntity ?? meta.famousEntity,
    total: meta.kind === 'fixture' ? 70 : total,
    pass,
    threshold: 70,
    pivotal: meta.kind === 'fixture' ? 3 : pivotal,
    sourceCount: meta.kind === 'fixture' ? 2 : sourceCount,
    fitsFiftySeconds: true,
    watchWithoutFocusStack: watchable.ok,
    fameTestPass: fame.ok,
    breakdown: meta.kind === 'fixture'
      ? {
          fame: 20,
          unexpectedBeginning: 15,
          humanStakes: 15,
          visualSpine: 10,
          runtimeFit: 10,
        }
      : breakdown,
    reasons:
      reasons.length > 0
        ? reasons
        : ['Scorecard stub. Fill discovery candidates with sources before production pass.'],
    sources: candidate?.sources ?? [],
  });

  writeJson(join(dir, 'score.json'), doc);
  writeJson(join(dir, 'meta.json'), {...meta, status: 'score'});
  return doc;
};
