/**
 * Opt-in aged-film wrapper for Before It Was Famous / FocusStack Shorts.
 *
 * Wrap any scene (or just the still stack) to get scanlines, a grain/grunge
 * texture sandwich, vignette, a sepia grade, and 12fps gate-weave. This is
 * NOT a replacement for LookEngine — keep using LookEngine for the channel
 * editorial look; nest or skip this wrapper per scene.
 *
 * Usage:
 *   import {FilmTreatment} from '../engine';
 *
 *   <FilmTreatment>
 *     <YourScene />
 *   </FilmTreatment>
 *
 *   // SceneFrame opt-in (CaptionBand stays outside the wrap so karaoke
 *   // layout at y=1320 is unchanged):
 *   <SceneFrame spec={spec} {...props} filmTreatment />
 *
 *   // Kill one layer, or the whole wrap:
 *   <FilmTreatment grain={false} saturate={0.8}>...</FilmTreatment>
 *   <FilmTreatment enabled={false}>...</FilmTreatment>
 *
 * Source textures: public/engine/grain.jpg + grunge.jpg (do not swap).
 * Render uses luma plates baked by tools/bake_film_plates.py:
 *   grain-plate.png = invert + brightness 1.35 + contrast 1.02 (CSS order)
 *   grunge-plate.png = luma-only grunge
 * CSS invert() on a mix-blend layer is unsafe in Remotion headless Chromium
 * (swangle): invert can leak onto the composited backdrop, and inverted
 * sepia reads as neon / night-vision green. Plates keep the locked ops
 * without a live invert filter. Existing film-grain.png stays on LookEngine.
 *
 * Layer stack when enabled, top → bottom:
 *   1. Scan lines — 1.6px black @ 16%, every 8px, blur 0.7px
 *   2. Texture sandwich — grain plate multiply @ 55%; then grunge plate
 *      color-burn @ 16%
 *   3. Vignette — ellipse 92% × 82% at 50% / 48%, clear to 55%,
 *      black 50% at the edge
 *   4. Grade — saturate / contrast / sepia / brightness (props)
 *   5. Gate-weave — 12fps stepped wiggle, ~5px travel, scale 1.012
 *
 * Children are Freeze'd to the shared 12fps posterize step in filmTime.ts.
 * isolation:isolate flattens blends before LookEngine's parent filter.
 * Canvas is 1080×1920 AbsoluteFill. Overlays are pointer-events: none.
 */
import React from 'react';
import {
  AbsoluteFill,
  Freeze,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  GATE_WEAVE_SCALE,
  gateWeaveOffset,
  posterizeFrame,
} from './filmTime';

export const FILM_GRAIN_SRC = 'engine/grain.jpg';
export const FILM_GRUNGE_SRC = 'engine/grunge.jpg';
export const FILM_GRAIN_PLATE_SRC = 'engine/grain-plate.png';
export const FILM_GRUNGE_PLATE_SRC = 'engine/grunge-plate.png';

export const FILM_TREATMENT_DEFAULTS = {
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
} as const;

export type FilmTreatmentProps = {
  enabled?: boolean;
  scanLines?: boolean;
  grain?: boolean;
  grunge?: boolean;
  vignette?: boolean;
  grade?: boolean;
  gateWeave?: boolean;
  saturate?: number;
  contrast?: number;
  sepia?: number;
  brightness?: number;
  children: React.ReactNode;
};

const overlayFill: React.CSSProperties = {
  pointerEvents: 'none',
};

const coverImg: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const ScanLinesLayer: React.FC = () => (
  <AbsoluteFill
    style={{
      ...overlayFill,
      backgroundImage:
        'repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1.6px, transparent 1.6px, transparent 8px)',
      filter: 'blur(0.7px)',
    }}
  />
);

const GrainLayer: React.FC = () => (
  <AbsoluteFill
    style={{
      ...overlayFill,
      mixBlendMode: 'multiply',
      opacity: 0.55,
    }}
  >
    <Img src={staticFile(FILM_GRAIN_PLATE_SRC)} style={coverImg} />
  </AbsoluteFill>
);

const GrungeLayer: React.FC = () => (
  <AbsoluteFill
    style={{
      ...overlayFill,
      mixBlendMode: 'color-burn',
      opacity: 0.16,
    }}
  >
    <Img src={staticFile(FILM_GRUNGE_PLATE_SRC)} style={coverImg} />
  </AbsoluteFill>
);

const VignetteLayer: React.FC = () => (
  <AbsoluteFill
    style={{
      ...overlayFill,
      background:
        'radial-gradient(ellipse 92% 82% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
    }}
  />
);

export const FilmTreatment: React.FC<FilmTreatmentProps> = ({
  enabled = FILM_TREATMENT_DEFAULTS.enabled,
  scanLines = FILM_TREATMENT_DEFAULTS.scanLines,
  grain = FILM_TREATMENT_DEFAULTS.grain,
  grunge = FILM_TREATMENT_DEFAULTS.grunge,
  vignette = FILM_TREATMENT_DEFAULTS.vignette,
  grade = FILM_TREATMENT_DEFAULTS.grade,
  gateWeave = FILM_TREATMENT_DEFAULTS.gateWeave,
  saturate = FILM_TREATMENT_DEFAULTS.saturate,
  contrast = FILM_TREATMENT_DEFAULTS.contrast,
  sepia = FILM_TREATMENT_DEFAULTS.sepia,
  brightness = FILM_TREATMENT_DEFAULTS.brightness,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stepped = posterizeFrame(frame, fps);
  const weave = gateWeave ? gateWeaveOffset(frame, fps) : {x: 0, y: 0};
  const scale = gateWeave ? GATE_WEAVE_SCALE : 1;

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AbsoluteFill style={{overflow: 'hidden', isolation: 'isolate'}}>
      <AbsoluteFill
        style={{
          isolation: 'isolate',
          transform: `translate(${weave.x}px, ${weave.y}px) scale(${scale})`,
        }}
      >
        <AbsoluteFill
          style={{
            filter: grade
              ? `saturate(${saturate}) contrast(${contrast}) sepia(${sepia}) brightness(${brightness})`
              : undefined,
          }}
        >
          <Freeze frame={stepped}>
            <AbsoluteFill>{children}</AbsoluteFill>
          </Freeze>
        </AbsoluteFill>
        {vignette ? <VignetteLayer /> : null}
        {grunge ? <GrungeLayer /> : null}
        {grain ? <GrainLayer /> : null}
        {scanLines ? <ScanLinesLayer /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
