import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {FPS} from '../../engine/constants';
import {STORYBOARD_PROMPT} from '../prompts/templates';
import {
  isFixture,
  readJson,
  readMeta,
  requireGate,
  resolveEpisodeDir,
  writeJson,
  writeText,
} from '../paths';
import {
  scriptSchema,
  storyboardSchema,
  timestampsSchema,
  type StoryboardDoc,
} from '../schema/episode';

export const storyboardStage = async (slug: string): Promise<StoryboardDoc> => {
  if (!isFixture(slug)) {
    requireGate(slug, 'narrationLocked');
  }
  const dir = resolveEpisodeDir(slug);
  const meta = readMeta(slug);
  writeText(join(dir, 'prompts', 'storyboard.md'), STORYBOARD_PROMPT);

  const existing = join(dir, 'storyboard.json');
  if (existsSync(existing)) {
    return storyboardSchema.parse(readJson(existing));
  }

  const script = scriptSchema.parse(readJson(join(dir, 'script.json')));
  const stamps = timestampsSchema.parse(
    readJson(join(dir, 'audio', 'timestamps.json')),
  );

  const beats = stamps.lines.map((line, i) => ({
    id: `b${String(i + 1).padStart(2, '0')}`,
    index: i + 1,
    startSec: line.start,
    endSec: line.end,
    voiceoverLineId: script.lines[i]?.id ?? `vo-${String(i + 1).padStart(2, '0')}`,
    visual: line.text,
    stillId: `still-${String(i + 1).padStart(2, '0')}`,
    osLockup: null,
    identityPlate: null,
    sourcePreference: 'generate' as const,
  }));

  if (!isFixture(slug) && (beats.length < 8 || beats.length > 13)) {
    throw new Error(
      `Storyboard must be 8–12 beats typically, 13 when locked VO is one line per beat (got ${beats.length}). Split or merge against locked VO; script ≠ N stills.`,
    );
  }

  const doc = storyboardSchema.parse({
    slug,
    narrationLocked: true,
    durationSec: stamps.totalDuration,
    beats,
    identityPlates: [],
  });
  writeJson(existing, {
    ...doc,
    fps: FPS,
    operatorNote:
      'Beats follow locked audio, not essay paragraphs. Identity-plate anyone who appears more than once.',
  });
  writeJson(join(dir, 'meta.json'), {...meta, status: 'storyboard'});
  return doc;
};
