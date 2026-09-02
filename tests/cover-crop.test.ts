import {describe, expect, it} from 'vitest';
import {assertNineSixteen, computeCoverCrop} from '../src/factory/stills/coverCrop';
import {WIDTH, HEIGHT} from '../src/engine/constants';

describe('cover-crop', () => {
  it('crops the sides of landscape into 1080×1920', () => {
    const box = computeCoverCrop(1920, 1080);
    expect(box.destW).toBe(WIDTH);
    expect(box.destH).toBe(HEIGHT);
    expect(box.cropH).toBeCloseTo(1080, 5);
    expect(box.cropW).toBeLessThan(1920);
    expect(box.srcY).toBe(0);
    expect(box.srcX).toBeGreaterThan(0);
  });

  it('crops a square into 9:16', () => {
    const box = computeCoverCrop(1024, 1024);
    expect(box.destW).toBe(1080);
    expect(box.destH).toBe(1920);
    expect(box.cropH).toBeCloseTo(1024, 5);
    expect(box.cropW).toBeLessThan(1024);
  });

  it('biases toward the top when the source is taller than 9:16', () => {
    const box = computeCoverCrop(1080, 2400);
    expect(box.cropW).toBeCloseTo(1080, 5);
    expect(box.cropH).toBeLessThan(2400);
    const centered = (2400 - box.cropH) / 2;
    expect(box.srcY).toBeLessThan(centered);
  });

  it('rejects 1088 width', () => {
    expect(() => assertNineSixteen(1088, 1920)).toThrow(/1088/);
    expect(() => assertNineSixteen(1080, 1920)).not.toThrow();
  });
});
