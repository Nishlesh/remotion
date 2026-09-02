import {join} from 'node:path';
import {runQa} from '../qa/checks';
import {readMeta, resolveEpisodeDir, writeJson} from '../paths';

export const qaStage = async (slug: string) => {
  const report = runQa(slug);
  writeJson(join(resolveEpisodeDir(slug), 'qa.json'), report);
  writeJson(join(resolveEpisodeDir(slug), 'meta.json'), {
    ...readMeta(slug),
    status: 'qa',
  });
  if (!report.ok) {
    const fails = report.issues.filter((i) => i.severity === 'fail');
    throw new Error(
      `QA failed for ${slug}:\n${fails.map((f) => `- ${f.code}: ${f.message}`).join('\n')}`,
    );
  }
  return report;
};
