import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  FILM_GRAIN_SRC,
  FILM_GRUNGE_SRC,
  FILM_POSTERIZE_FPS,
  FILM_TREATMENT_DEFAULTS,
  GATE_WEAVE_SCALE,
  GATE_WEAVE_TRAVEL_PX,
  filmTick,
  gateWeaveOffset,
  posterizeFrame,
} from '../src/engine';
import {repoRoot} from '../src/factory/paths';

describe('filmTime posterize', () => {
  it('holds 30fps onto 12 distinct frames per second', () => {
    const held = Array.from({length: 30}, (_, frame) =>
      posterizeFrame(frame, 30, FILM_POSTERIZE_FPS),
    );
    expect(new Set(held).size).toBe(12);
    expect(held[0]).toBe(0);
    expect(held[1]).toBe(0);
    expect(held[2]).toBe(0);
    expect(held[3]).toBe(2);
  });

  it('filmTick advances 12 times per 30 frames', () => {
    const ticks = Array.from({length: 30}, (_, frame) => filmTick(frame, 30));
    expect(new Set(ticks).size).toBe(12);
    expect(ticks[0]).toBe(0);
    expect(ticks[29]).toBe(11);
  });

  it('gate-weave is stepped and stays within travel', () => {
    const a = gateWeaveOffset(0, 30);
    const b = gateWeaveOffset(2, 30);
    const c = gateWeaveOffset(3, 30);
    expect(a).toEqual(b);
    expect(c).not.toEqual(a);
    expect(Math.abs(a.x)).toBeLessThanOrEqual(GATE_WEAVE_TRAVEL_PX / 2);
    expect(Math.abs(a.y)).toBeLessThanOrEqual(GATE_WEAVE_TRAVEL_PX / 2);
    expect(GATE_WEAVE_SCALE).toBe(1.012);
  });
});

describe('FilmTreatment assets + defaults', () => {
  it('commits grain.jpg and grunge.jpg under public/engine', () => {
    const root = repoRoot();
    expect(existsSync(join(root, 'public', FILM_GRAIN_SRC))).toBe(true);
    expect(existsSync(join(root, 'public', FILM_GRUNGE_SRC))).toBe(true);
    expect(existsSync(join(root, 'public', 'engine', 'film-grain.png'))).toBe(
      true,
    );
  });

  it('exposes the requested grade defaults', () => {
    expect(FILM_TREATMENT_DEFAULTS).toMatchObject({
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
    });
  });
});
