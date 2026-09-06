import {existsSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';
import {repoRoot} from '../src/factory/paths';
import {which} from '../src/factory/karaoke/burn';

const PROPS = {
  compare: false,
  captions: false,
  enabled: true,
  scanLines: true,
  grain: true,
  grunge: true,
  vignette: true,
  grade: true,
  gateWeave: true,
  saturate: 0.86,
  contrast: 1.08,
  sepia: 0.16,
  brightness: 0.95,
  stillSrc: 'episodes/whatsapp-2009/stills/still-01.jpg',
  stackLookEngine: true,
};

describe('FilmTreatment headless render is not night-vision green', () => {
  it(
    'remotion still mean G does not dominate R and B by 40+',
    () => {
      const root = repoRoot();
      const remotion = join(root, 'node_modules', '.bin', 'remotion');
      if (!existsSync(remotion)) {
        return;
      }
      const outDir = join(root, 'out');
      mkdirSync(outDir, {recursive: true});
      const png = join(outDir, 'film-treatment-green-check.png');
      const still = spawnSync(
        remotion,
        [
          'still',
          'FilmTreatmentDemo',
          png,
          '--frame=12',
          '--timeout=180000',
          `--props=${JSON.stringify(PROPS)}`,
        ],
        {encoding: 'utf8', cwd: root},
      );
      expect(still.status, still.stderr || still.stdout).toBe(0);
      expect(existsSync(png)).toBe(true);

      const check = spawnSync(
        which('python3') ?? 'python3',
        [join(root, 'tools', 'check_frame_not_green.py'), png],
        {encoding: 'utf8', cwd: root},
      );
      expect(check.status, check.stderr || check.stdout).toBe(0);
      const stats = JSON.parse(check.stdout) as {
        r: number;
        g: number;
        b: number;
        night_vision: boolean;
      };
      expect(stats.night_vision).toBe(false);
      expect(stats.g).toBeLessThan(stats.r + 40);
      expect(stats.g).toBeLessThan(stats.b + 40);
    },
    180_000,
  );
});
