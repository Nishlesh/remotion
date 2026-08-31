/** Locked output for every FocusStack vertical short. */
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * Karaoke Highlight captions live here. Key art and stills must keep this
 * band visually clear so type never collides with objects.
 */
export const CAPTION_BAND = {
  top: 1200,
  bottom: 1440,
  left: 88,
  right: 88,
} as const;

export const TARGET_DURATION_SEC = {min: 25, max: 50} as const;
