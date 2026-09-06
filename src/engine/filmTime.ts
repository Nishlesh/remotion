/** Shared 12fps posterize + gate-weave math. Pure functions — no Remotion hooks. */

export const FILM_POSTERIZE_FPS = 12;
export const GATE_WEAVE_TRAVEL_PX = 5;
export const GATE_WEAVE_SCALE = 1.012;

/**
 * Hold `frame` on a 12fps (or `filmFps`) step so motion matches a film shutter.
 * At 30fps this yields 12 distinct held frames per second.
 */
export const posterizeFrame = (
  frame: number,
  fps: number,
  filmFps: number = FILM_POSTERIZE_FPS,
): number => {
  if (fps <= 0 || filmFps <= 0) {
    return frame;
  }
  const filmFrame = Math.floor((frame * filmFps) / fps);
  return Math.floor((filmFrame * fps) / filmFps);
};

/** Integer 12fps tick for stepped wiggle (changes 12 times per second). */
export const filmTick = (
  frame: number,
  fps: number,
  filmFps: number = FILM_POSTERIZE_FPS,
): number => {
  if (fps <= 0 || filmFps <= 0) {
    return frame;
  }
  return Math.floor((frame * filmFps) / fps);
};

/** Deterministic 0–1 hash. Stable across renders. */
export const filmHash = (n: number, salt: number): number => {
  const x = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/** Stepped gate-weave offset. Peak travel is `GATE_WEAVE_TRAVEL_PX` (±2.5px). */
export const gateWeaveOffset = (
  frame: number,
  fps: number,
): {x: number; y: number} => {
  const tick = filmTick(frame, fps);
  return {
    x: (filmHash(tick, 1) - 0.5) * GATE_WEAVE_TRAVEL_PX,
    y: (filmHash(tick, 19) - 0.5) * GATE_WEAVE_TRAVEL_PX,
  };
};
