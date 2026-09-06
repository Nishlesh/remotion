import {
  FORBIDDEN_WIDTH,
  HEIGHT,
  MAX_DURATION_SEC,
  MIN_DURATION_SEC,
  WIDTH,
} from '../../engine/constants';

export type DurationGate = {
  ok: boolean;
  durationSec: number;
  code: string;
  message: string;
};

export const durationGate = (
  durationSec: number,
  opts?: {fixture?: boolean},
): DurationGate => {
  if (durationSec > MAX_DURATION_SEC) {
    return {
      ok: false,
      durationSec,
      code: 'duration_over_50',
      message: `Runtime ${durationSec.toFixed(3)}s exceeds 50.0s. Never above 50.0.`,
    };
  }
  if (!opts?.fixture && durationSec < MIN_DURATION_SEC) {
    return {
      ok: false,
      durationSec,
      code: 'duration_under_25',
      message: `Runtime ${durationSec.toFixed(3)}s is under 25s.`,
    };
  }
  return {
    ok: true,
    durationSec,
    code: 'duration_ok',
    message: `Runtime ${durationSec.toFixed(3)}s is within lock.`,
  };
};

export const dimensionGate = (
  width: number,
  height: number,
): {ok: boolean; code: string; message: string} => {
  if (width === FORBIDDEN_WIDTH) {
    return {
      ok: false,
      code: 'width_1088',
      message: 'NEVER 1088×1920. Output must be 1080×1920.',
    };
  }
  if (width !== WIDTH || height !== HEIGHT) {
    return {
      ok: false,
      code: 'bad_dimensions',
      message: `Output is ${width}×${height}; required ${WIDTH}×${HEIGHT}.`,
    };
  }
  return {ok: true, code: 'dimensions_ok', message: '1080×1920'};
};
