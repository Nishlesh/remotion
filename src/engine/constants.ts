/** Locked output for every FocusStack vertical short. */
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * Karaoke Highlight overlay lives here. Plates fill the full 1080×1920
 * canvas (object-fit cover), including this band — captions sit on photo.
 */
export const CAPTION_BAND = {
  top: 1200,
  bottom: 1440,
  left: 140,
  right: 140,
} as const;

export const CAPTION_BASELINE_Y = 1320;
export const CAPTION_MAX_LINE_WIDTH = 800;
export const CAPTION_INACTIVE_SIZE = 68;
export const CAPTION_ACTIVE_SIZE = 71;
export const CAPTION_STROKE_PX = 8;
export const CAPTION_LINE_HEIGHT = 86;
export const CAPTION_ASCENT = 58;
export const CAPTION_FILL_INACTIVE = '#FFFFFF';
export const CAPTION_FILL_ACTIVE = '#FFE14A';
export const CAPTION_STROKE = '#000000';
export const CAPTION_MIN_CHUNK_WORDS = 3;
export const CAPTION_MAX_CHUNK_WORDS = 6;

/** Full-canvas plate. Stills mount 1080×1920 1:1 — no 1200px crop. */
export const PICTURE_WINDOW = {
  x: 0,
  y: 0,
  width: WIDTH,
  height: HEIGHT,
} as const;

export const FALLOFF_TOP = 1440;
