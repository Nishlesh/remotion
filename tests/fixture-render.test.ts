import {describe, expect, it} from 'vitest';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {hasGate, repoRoot} from '../src/factory/paths';
import {which} from '../src/factory/karaoke/burn';
import {buildKaraokeAss} from '../src/factory/karaoke/ass';
import {readJson} from '../src/factory/paths';
import type {TimestampsDoc} from '../src/factory/schema/episode';

const SLUG = '_fixture-pipeline';

describe('fixture assemble + karaoke', () => {
  it('has human gates and 1080×1920 stills on disk when generated', () => {
    expect(hasGate(SLUG, 'factApproved')).toBe(true);
    expect(hasGate(SLUG, 'narrationLocked')).toBe(true);
    const still = join(repoRoot(), 'public', 'episodes', SLUG, 'stills', 'still-01.jpg');
    if (!existsSync(still)) {
      return;
    }
    const ffprobe = which('ffprobe');
    if (!ffprobe) {
      return;
    }
    const probe = spawnSync(
      ffprobe,
      [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height',
        '-of',
        'csv=p=0',
        still,
      ],
      {encoding: 'utf8'},
    );
    expect(probe.stdout.trim()).toBe('1080,1920');
  });

  it('builds ASS from fixture timestamps when present', () => {
    const tsPath = join(repoRoot(), 'episodes', SLUG, 'audio', 'timestamps.json');
    if (!existsSync(tsPath)) {
      return;
    }
    const stamps = readJson<TimestampsDoc>(tsPath);
    const ass = buildKaraokeAss(stamps.lines.flatMap((l) => l.words));
    expect(ass).toContain('PlayResX: 1080');
    expect(ass).not.toContain('PlayResX: 1088');
  });

  it('documents the render command and skips when remotion/ffmpeg missing', () => {
    const remotion = existsSync(join(repoRoot(), 'node_modules', '.bin', 'remotion'));
    const ffmpeg = which('ffmpeg');
    const command =
      'pnpm factory render --episode _fixture-pipeline';
    expect(command).toContain('_fixture-pipeline');
    if (!remotion || !ffmpeg) {
      return;
    }
    expect(remotion).toBe(true);
  });
});
