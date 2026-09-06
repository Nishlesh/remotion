import {HEIGHT, WIDTH} from '../../engine/constants';

export type CoverCropBox = {
  srcX: number;
  srcY: number;
  cropW: number;
  cropH: number;
  destW: number;
  destH: number;
  scale: number;
};

/**
 * Cover-crop any still into 1080×1920.
 * Image models ignore 9:16 — always crop after download/generate.
 * Bias slightly toward the top so the hero sits in y≈80–1100.
 */
export const computeCoverCrop = (
  srcW: number,
  srcH: number,
  destW = WIDTH,
  destH = HEIGHT,
  centerY = 0.38,
): CoverCropBox => {
  if (srcW <= 0 || srcH <= 0) {
    throw new Error('Source still has invalid dimensions');
  }
  const scale = Math.max(destW / srcW, destH / srcH);
  const cropW = destW / scale;
  const cropH = destH / scale;
  const srcX = Math.max(0, (srcW - cropW) / 2);
  const srcY = Math.max(0, Math.min(srcH - cropH, (srcH - cropH) * centerY));
  return {
    srcX,
    srcY,
    cropW,
    cropH,
    destW,
    destH,
    scale,
  };
};

export const assertNineSixteen = (width: number, height: number): void => {
  if (width === 1088) {
    throw new Error('NEVER 1088×1920');
  }
  if (width !== WIDTH || height !== HEIGHT) {
    throw new Error(`Stills must be ${WIDTH}×${HEIGHT}, got ${width}×${height}`);
  }
};
