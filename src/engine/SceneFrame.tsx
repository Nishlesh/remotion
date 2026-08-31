import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CaptionBand} from './CaptionBand';
import {LookEngine} from './LookEngine';
import {useEntrance, useKenBurns, useSceneFade} from './motion';
import {OsLockup} from './OsLockup';
import type {SceneProps} from './schemas';
import {StillLayer} from './StillLayer';
import type {SceneSpec} from './types';

type SceneFrameProps = SceneProps & {
  spec: SceneSpec;
  children?: React.ReactNode;
  captionsEnabled?: boolean;
};

/**
 * Shared scene renderer. Each spoken-line file passes its JSON spec plus
 * Studio-overridable props. Optional children are extra depth layers.
 */
export const SceneFrame: React.FC<SceneFrameProps> = ({
  spec,
  timing,
  motion,
  grade,
  caption,
  children,
  captionsEnabled = true,
}) => {
  const kenBurns = useKenBurns(motion.kenBurns);
  const entrance = useEntrance(motion.entrance);
  const fade = useSceneFade(timing.fadeInFrames, timing.fadeOutFrames);
  const showCaptions = captionsEnabled;

  return (
    <LookEngine grade={grade} opacity={fade}>
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
