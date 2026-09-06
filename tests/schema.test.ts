import {describe, expect, it} from 'vitest';
import {parseEpisode} from '../src/engine/episodeJson';
import {episodeMetaSchema, scriptSchema, timestampsSchema} from '../src/factory/schema/episode';
import github from '../src/episodes/github-2008/episode.json';
import fixture from '../src/episodes/_fixture-pipeline/episode.json';
import fixtureMeta from '../episodes/_fixture-pipeline/meta.json';
import fixtureScript from '../episodes/_fixture-pipeline/script.json';

describe('episode schema', () => {
  it('parses Github 2008 Remotion spec', () => {
    const spec = parseEpisode(github);
    expect(spec.compositionId).toBe('Github2008');
    expect(spec.scenes.every((s) => s.stills.bg.width === 1080)).toBe(true);
    expect(spec.scenes.every((s) => s.stills.bg.height === 1920)).toBe(true);
    expect(spec.scenes.some((s) => s.stills.bg.width === 1088)).toBe(false);
  });

  it('parses fixture Remotion spec at 1080×1920', () => {
    const spec = parseEpisode(fixture);
    expect(spec.compositionId).toBe('FixturePipeline');
    expect(spec.captionsEnabled).toBe(false);
    expect(spec.grade.warm).toBeGreaterThan(0);
    expect(spec.targetDurationSec).toBeLessThanOrEqual(50);
  });

  it('parses factory meta + script', () => {
    expect(episodeMetaSchema.parse(fixtureMeta).kind).toBe('fixture');
    const script = scriptSchema.parse(fixtureScript);
    expect(script.dropRuleApplied).toBe(true);
    expect(script.spoken.split(/\s+/).length).toBe(script.spokenWordCount);
  });

  it('timestamps schema accepts word-level stamps', () => {
    const sample = {
      episode: 'x',
      engine: 'fixture-tts',
      voice: 'am_michael',
      speed: 0.95,
      sampleRate: 24000,
      gapSeconds: 0.1,
      totalDuration: 2,
      lines: [
        {
          i: 1,
          text: 'Hello world.',
          file: '01.wav',
          start: 0,
          end: 2,
          duration: 2,
          words: [
            {word: 'Hello', start: 0.1, end: 0.6},
            {word: 'world.', start: 0.7, end: 1.8},
          ],
        },
      ],
    };
    expect(timestampsSchema.parse(sample).lines[0].words).toHaveLength(2);
  });
});
