import {spawnSync} from 'node:child_process';
import {existsSync, renameSync} from 'node:fs';
import {join} from 'node:path';
import {HEIGHT, WIDTH} from '../../engine/constants';
import {repoRoot} from '../paths';
import {which} from '../karaoke/burn';
import {assertNineSixteen, computeCoverCrop} from './coverCrop';

const pythonBin = (): string => which('python3') ?? which('python') ?? 'python3';

export const coverCropScript = (): string =>
  join(repoRoot(), 'tools', 'cover_crop.py');

/**
 * Always cover-crop to 1080×1920. Prefer Pillow (PIL). Fall back to ffmpeg.
 */
export const applyCoverCrop = (inputPath: string, outputPath: string): void => {
  const tmp = `${outputPath}.crop-tmp.jpg`;
  const py = coverCropScript();
  if (existsSync(py)) {
    const result = spawnSync(
      pythonBin(),
      [py, inputPath, tmp, String(WIDTH), String(HEIGHT)],
      {encoding: 'utf8'},
    );
    if (result.status === 0 && existsSync(tmp)) {
      renameSync(tmp, outputPath);
      return;
    }
  }

  const ffmpeg = which('ffmpeg');
  if (!ffmpeg) {
    throw new Error(
      `Cover-crop failed. Install Pillow (pip install pillow) or ffmpeg. Tried ${inputPath}`,
    );
  }
  const probeBin = which('ffprobe') ?? ffmpeg.replace(/ffmpeg$/, 'ffprobe');
  const probe = spawnSync(
    probeBin,
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'csv=p=0',
      inputPath,
    ],
    {encoding: 'utf8'},
  );
  let vf = `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`;
  if (probe.status === 0 && probe.stdout.trim()) {
    const [w, h] = probe.stdout.trim().split(',').map(Number);
    if (w && h) {
      const box = computeCoverCrop(w, h);
      vf = `scale=${Math.round(w * box.scale)}:${Math.round(h * box.scale)},crop=${WIDTH}:${HEIGHT}:${Math.round(box.srcX * box.scale)}:${Math.round(box.srcY * box.scale)}`;
    }
  }
  const result = spawnSync(
    ffmpeg,
    ['-y', '-i', inputPath, '-vf', vf, tmp],
    {encoding: 'utf8'},
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || 'ffmpeg cover-crop failed');
  }
  renameSync(tmp, outputPath);
};

export const assertOutputNineSixteen = (width: number, height: number): void =>
  assertNineSixteen(width, height);
