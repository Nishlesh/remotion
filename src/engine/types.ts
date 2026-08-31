/**
 * Locked episode spec. Voiceover is the source of truth: scenes are derived
 * from spoken lines (one line → one scene file), not the other way around.
 * A factory can emit this JSON; later episodes clone the engine and swap spec + stills.
 */

export type KenBurnsMotion = {
  startScale: number;
  endScale: number;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};

export type ParallaxMotion = {
  /** Extra travel applied to layers with depth > 0, in pixels. */
  amount: number;
};

export type EntranceMotion = {
  /** Spring damping. Higher = slower, more editorial. */
  damping: number;
};

export type SceneMotion = {
  kenBurns: KenBurnsMotion;
  parallax: ParallaxMotion;
  entrance: EntranceMotion;
};

export type GradeSpec = {
  contrast: number;
  saturation: number;
  brightness: number;
  /** Cool/neutral wash 0–1. This engine is tasteful cool/neutral, not a warm film soak. */
  cool: number;
  vignette: number;
};

export type StillLayer = {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** 0 = background (moves with Ken Burns only), 1 = foreground (extra parallax). */
  depth: number;
  blend?: 'normal' | 'screen' | 'soft-light';
  invertParallax?: boolean;
  /** Extra horizontal travel over the scene, in pixels. */
  shiftX?: number;
  width?: number;
  height?: number;
  fromFrame?: number;
  toFrame?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  objectPosition?: string;
  /** CSS transform-origin for Ken Burns scale. Github2008 plates use `center top`. */
  transformOrigin?: string;
  /** Mount mode. 1080×1920 plates use `fill` (1:1, no cover-scale). */
  objectFit?: 'fill' | 'cover' | 'contain';
};

export type SceneStills = {
  bg: StillLayer;
  layers: StillLayer[];
};

export type OsLockupSpec = {
  text: string;
  y: number;
  size?: 'large' | 'plate';
};

export type CaptionSpec = {
  /** On-screen text pulled from the spoken line. Casing as spoken. */
  text: string;
  /** Unused by CaptionBand. Kept so existing episode JSON does not break. */
  kicker: string;
  /** 0–1 bias on karaoke progress. 0.5 is even pacing. */
  highlightBias: number;
};

export type VoiceoverLine = {
  id: string;
  text: string;
  approximateDurationSec: number;
  /** Optional per-line wav/mp3 under `public/`. */
  audioFile?: string;
};

export type SceneSpec = {
  id: string;
  voiceoverLineId: string;
  durationInFrames: number;
  stills: SceneStills;
  captions: CaptionSpec;
  motion: SceneMotion;
  grade?: Partial<GradeSpec>;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  osLockup?: OsLockupSpec | null;
};

export type EpisodeAudio = {
  /** Locked full-episode VO. If missing, JSON durations drive the timeline. */
  voiceover?: string | null;
  bed?: string | null;
};

export type EpisodeFonts = {
  display: string;
  body: string;
};

export type EpisodeSpec = {
  id: string;
  title: string;
  compositionId: string;
  targetDurationSec: number;
  voiceover: VoiceoverLine[];
  scenes: SceneSpec[];
  audio?: EpisodeAudio;
  fonts?: EpisodeFonts;
  grade: GradeSpec;
  /** Default true. Github2008 hides CaptionBand so Caption Agent can burn karaoke later. */
  captionsEnabled?: boolean;
};
