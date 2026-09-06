import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {z} from 'zod';
import {CaptionBand} from './CaptionBand';
import {HEIGHT, WIDTH} from './constants';
import {FilmTreatment, FILM_TREATMENT_DEFAULTS} from './FilmTreatment';
import {montserratBlack} from './fonts';

export const FILM_TREATMENT_DEMO_STILL =
  'episodes/whatsapp-2009/stills/still-01.jpg';

export const filmTreatmentDemoSchema = z.object({
  compare: z.boolean(),
  captions: z.boolean(),
  enabled: z.boolean(),
  scanLines: z.boolean(),
  grain: z.boolean(),
  grunge: z.boolean(),
  vignette: z.boolean(),
  grade: z.boolean(),
  gateWeave: z.boolean(),
  saturate: z.number().min(0).max(2),
  contrast: z.number().min(0).max(2),
  sepia: z.number().min(0).max(1),
  brightness: z.number().min(0).max(2),
  stillSrc: z.string(),
});

export type FilmTreatmentDemoProps = z.infer<typeof filmTreatmentDemoSchema>;

export const filmTreatmentDemoProps: FilmTreatmentDemoProps = {
  compare: true,
  captions: true,
  stillSrc: FILM_TREATMENT_DEMO_STILL,
  ...FILM_TREATMENT_DEFAULTS,
};

const StillPlate: React.FC<{src: string}> = ({src}) => (
  <AbsoluteFill style={{backgroundColor: '#07090d'}}>
    <Img
      src={staticFile(src)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
      }}
    />
  </AbsoluteFill>
);

const Plate: React.FC<
  FilmTreatmentDemoProps & {treated: boolean}
> = ({
  treated,
  stillSrc,
  captions,
  enabled,
  scanLines,
  grain,
  grunge,
  vignette,
  grade,
  gateWeave,
  saturate,
  contrast,
  sepia,
  brightness,
}) => {
  const still = <StillPlate src={stillSrc} />;
  const body = treated ? (
    <FilmTreatment
      enabled={enabled}
      scanLines={scanLines}
      grain={grain}
      grunge={grunge}
      vignette={vignette}
      grade={grade}
      gateWeave={gateWeave}
      saturate={saturate}
      contrast={contrast}
      sepia={sepia}
      brightness={brightness}
    >
      {still}
    </FilmTreatment>
  ) : (
    still
  );

  return (
    <AbsoluteFill>
      {body}
      {captions ? (
        <CaptionBand
          text="Before it was famous."
          highlightBias={0.5}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const QcLabel: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      top: 18,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontFamily: montserratBlack,
      fontWeight: 900,
      fontSize: 28,
      letterSpacing: 4,
      color: '#FFFFFF',
      textShadow: '0 2px 0 #000, 0 0 10px rgba(0,0,0,0.8)',
      pointerEvents: 'none',
      zIndex: 4,
    }}
  >
    {text}
  </div>
);

const ScaledHalf: React.FC<{
  top: number;
  label: string;
  children: React.ReactNode;
}> = ({top, label, children}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 0,
      width: WIDTH,
      height: HEIGHT / 2,
      overflow: 'hidden',
      backgroundColor: '#07090d',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: (WIDTH - WIDTH * 0.5) / 2,
        top: 0,
        width: WIDTH,
        height: HEIGHT,
        transform: 'scale(0.5)',
        transformOrigin: 'top left',
      }}
    >
      {children}
    </div>
    <QcLabel text={label} />
  </div>
);

/**
 * Studio QC: one still unwrapped vs wrapped. Default is a stacked compare
 * at native 1080×1920 treatment resolution (each half scaled). Set
 * `compare` false for a full-bleed treated Shorts frame.
 */
export const FilmTreatmentDemo: React.FC<FilmTreatmentDemoProps> = (props) => {
  if (!props.compare) {
    return (
      <AbsoluteFill>
        <Plate {...props} treated={props.enabled} />
        <QcLabel text={props.enabled ? 'FILM TREATMENT' : 'UNWRAPPED'} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{backgroundColor: '#050608'}}>
      <ScaledHalf top={0} label="UNWRAPPED">
        <Plate {...props} treated={false} />
      </ScaledHalf>
      <ScaledHalf top={HEIGHT / 2} label="FILM TREATMENT">
        <Plate {...props} treated={true} />
      </ScaledHalf>
    </AbsoluteFill>
  );
};
