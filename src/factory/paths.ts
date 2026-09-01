import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {GATE_FILES, episodeMetaSchema, type EpisodeMeta} from './schema/episode';

export const repoRoot = (): string => {
  const fromEnv = process.env.FACTORY_ROOT;
  if (fromEnv && existsSync(join(fromEnv, 'package.json'))) {
    return resolve(fromEnv);
  }
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'src'))) {
      return dir;
    }
    const parent = resolve(dir, '..');
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return process.cwd();
};

export const episodesRoot = (): string => join(repoRoot(), 'episodes');

export const episodeDir = (slug: string): string =>
  join(episodesRoot(), slug);

export const publicEpisodeDir = (slug: string): string =>
  join(repoRoot(), 'public', 'episodes', slug);

export const remotionEpisodeDir = (slug: string): string =>
  join(repoRoot(), 'src', 'episodes', slug);

export const resolveEpisodeDir = (slug: string): string => {
  const factory = episodeDir(slug);
  if (existsSync(factory)) {
    return factory;
  }
  const pub = publicEpisodeDir(slug);
  if (existsSync(pub)) {
    return pub;
  }
  return factory;
};

export const gatePath = (
  slug: string,
  gate: keyof typeof GATE_FILES,
): string => join(resolveEpisodeDir(slug), GATE_FILES[gate]);

export const hasGate = (slug: string, gate: keyof typeof GATE_FILES): boolean =>
  existsSync(gatePath(slug, gate));

export const requireGate = (
  slug: string,
  gate: keyof typeof GATE_FILES,
): void => {
  if (!hasGate(slug, gate)) {
    const file = GATE_FILES[gate];
    throw new Error(
      `Human gate missing: ${file} in ${resolveEpisodeDir(slug)}. ` +
        `Create that file after review. Never skip this gate.`,
    );
  }
};

export const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(path, 'utf8')) as T;

export const writeJson = (path: string, value: unknown): void => {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

export const writeText = (path: string, value: string): void => {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, value, 'utf8');
};

export const readMeta = (slug: string): EpisodeMeta => {
  const path = join(resolveEpisodeDir(slug), 'meta.json');
  if (!existsSync(path)) {
    return episodeMetaSchema.parse({
      slug,
      kind: slug.startsWith('_fixture') ? 'fixture' : 'production',
      channel: 'Before It Was Famous',
      handle: '@beforeitwasfamous',
      title: slug,
      famousEntity: slug,
      compositionId: slug.replace(/[^a-zA-Z0-9]/g, ''),
    });
  }
  return episodeMetaSchema.parse(readJson(path));
};

export const isFixture = (slug: string): boolean =>
  readMeta(slug).kind === 'fixture' || slug.startsWith('_fixture');

export const ensureEpisodeDir = (slug: string): string => {
  const dir = episodeDir(slug);
  mkdirSync(dir, {recursive: true});
  mkdirSync(join(dir, 'audio'), {recursive: true});
  mkdirSync(join(dir, 'stills'), {recursive: true});
  mkdirSync(join(dir, 'stock'), {recursive: true});
  mkdirSync(join(dir, 'generate'), {recursive: true});
  mkdirSync(join(dir, 'render'), {recursive: true});
  mkdirSync(join(dir, 'package'), {recursive: true});
  return dir;
};
