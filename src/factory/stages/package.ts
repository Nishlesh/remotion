import {copyFileSync, existsSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {readMeta, resolveEpisodeDir, writeJson, writeText} from '../paths';

export const packageStage = async (slug: string) => {
  const dir = resolveEpisodeDir(slug);
  const pack = join(dir, 'package');
  mkdirSync(pack, {recursive: true});
  const final =
    (existsSync(join(dir, 'render', 'final.mp4')) && join(dir, 'render', 'final.mp4')) ||
    (existsSync(join(dir, 'render', 'assemble.mp4')) &&
      join(dir, 'render', 'assemble.mp4')) ||
    null;
  if (final) {
    copyFileSync(final, join(pack, `${slug}.mp4`));
  }
  for (const file of ['script.json', 'licenses.json', 'qa.json', 'storyboard.json']) {
    const src = join(dir, file);
    if (existsSync(src)) {
      copyFileSync(src, join(pack, file));
    }
  }
  writeText(
    join(pack, 'PUBLISH.md'),
    [
      '# Manual publish only',
      '',
      'This factory never auto-publishes.',
      'The publish stage refuses unless a PUBLISH_GO file exists in the episode folder.',
      'Upload is a human step. There is no YouTube/Twitter/TikTok API in this repo.',
      '',
    ].join('\n'),
  );
  writeJson(join(dir, 'meta.json'), {...readMeta(slug), status: 'package'});
  return {pack, hasVideo: Boolean(final)};
};
