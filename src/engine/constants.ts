/** Locked output for every Before It Was Famous vertical short. */
export const CHANNEL_NAME = 'Before It Was Famous';
export const CHANNEL_HANDLE = '@beforeitwasfamous';
export const FOCUSSTACK_URL = 'https://usefocusstack.com';
export const FOCUSSTACK_ROLE = 'level-2-natural-close';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Some encoders pad 1080 → 1088. That is a hard fail, never a target. */
export const FORBIDDEN_WIDTH = 1088;

export const MIN_DURATION_SEC = 25;
export const MAX_DURATION_SEC = 50;
export const TARGET_DURATION_MIN_SEC = 35;
export const TARGET_DURATION_MAX_SEC = 45;

export const SAMPLE_RATE = 24000;
export const TTS_VOICE = 'am_michael';
export const TTS_SPEED = 0.95;
export const TTS_ENGINE = 'kokoro-onnx';
export const LINE_GAP_SEC = 0.1;

/**
 * Karaoke Highlight overlay lives here. Plates fill the full 1080×1920
 * canvas (object-fit fill, 1:1), including this band — captions sit on photo.
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

/** ASS karaoke burn (ffmpeg ass filter only — never `subtitles`). */
export const ASS_PLAY_RES_X = WIDTH;
export const ASS_PLAY_RES_Y = HEIGHT;
export const ASS_ALIGNMENT = 2;
export const ASS_MARGIN_L = 140;
export const ASS_MARGIN_R = 140;
export const ASS_MARGIN_V = 600;
export const ASS_ACTIVE_COLOR = '&H4AE1FF&';
export const ASS_INACTIVE_COLOR = '&H00FFFFFF&';
export const ASS_OUTLINE_COLOR = '&H00000000&';
export const ASS_FONT_NAME = 'Montserrat Black';

/** Full-canvas plate. Stills mount 1080×1920 1:1 — no 1200px crop. */
export const PICTURE_WINDOW = {
  x: 0,
  y: 0,
  width: WIDTH,
  height: HEIGHT,
} as const;

export const FALLOFF_TOP = 1440;
