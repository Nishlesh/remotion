import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CaptionBand} from './CaptionBand';
import {FilmTreatment, type FilmTreatmentProps} from './FilmTreatment';
import {LookEngine} from './LookEngine';
import {useEntrance, useKenBurns, useSceneFade} from './motion';
import {OsLockup} from './OsLockup';
import type {SceneProps} from './schemas';
import {StillLayer} from './StillLayer';
import type {SceneSpec} from './types';

export type FilmTreatmentOptIn =
  | boolean
  | Partial<Omit<FilmTreatmentProps, 'children'>>;

type SceneFrameProps = SceneProps & {
  spec: SceneSpec;
  children?: React.ReactNode;
  captionsEnabled?: boolean;
  /**
   * Opt into FilmTreatment around stills + lockup only.
   * CaptionBand stays outside so karaoke layout is unchanged.
   * LookEngine still wraps the scene. Default off.
   */
  filmTreatment?: FilmTreatmentOptIn;
};

/**
 * Shared scene renderer. Each spoken-line file passes its JSON spec plus
 * Studio-overridable props. Optional children are extra depth layers.
 */
const treatmentProps = (
  opt: Exclude<FilmTreatmentOptIn, false | undefined>,
): Partial<Omit<FilmTreatmentProps, 'children'>> => (opt === true ? {} : opt);

export const SceneFrame: React.FC<SceneFrameProps> = ({
  spec,
  timing,
  motion,
  grade,
  caption,
  children,
  captionsEnabled = true,
  filmTreatment,
}) => {
  const kenBurns = useKenBurns(motion.kenBurns);
  const entrance = useEntrance(motion.entrance);
  const fade = useSceneFade(timing.fadeInFrames, timing.fadeOutFrames);
  const showCaptions = captionsEnabled;

  const picture = (
    <>
      <AbsoluteFill
        style={{
          opacity: entrance.opacity,
          transform: `translateY(${entrance.y}px) scale(${entrance.scale})`,
        }}
      >
        <StillLayer
          {...spec.stills.bg}
          kenBurns={kenBurns}
          parallaxAmount={motion.parallax.amount}
        />
        {spec.stills.layers.map((layer) => (
          <StillLayer
            key={layer.id}
            {...layer}
            kenBurns={kenBurns}
            parallaxAmount={motion.parallax.amount}
          />
        ))}
        {children}
      </AbsoluteFill>
      {spec.osLockup ? (
        <OsLockup
          text={spec.osLockup.text}
          y={spec.osLockup.y}
          size={spec.osLockup.size}
        />
      ) : null}
    </>
  );

  return (
    <LookEngine grade={grade} opacity={fade}>
      {filmTreatment ? (
        <FilmTreatment {...treatmentProps(filmTreatment)}>
          {picture}
        </FilmTreatment>
      ) : (
        picture
      )}
      {showCaptions ? (
        <CaptionBand
          kicker={caption.kicker}
          text={caption.text}
          highlightBias={caption.highlightBias}
        />
      ) : null}
    </LookEngine>
  );
};
