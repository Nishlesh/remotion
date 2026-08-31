import React from 'react';
import {montserratBlack} from './fonts';

type OsLockupProps = {
  text: string;
  y?: number;
  size?: 'large' | 'plate';
};

/**
 * On-screen date/time/status plate. Remotion text, never burned into stills.
 * Lives in the picture window (typically y=140–380). Never in the caption band.
 */
export const OsLockup: React.FC<OsLockupProps> = ({
  text,
  y = 180,
  size = 'plate',
}) => {
  const fontSize = size === 'large' ? 64 : 36;
  const tracking = size === 'large' ? 8 : 6;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 8,
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: size === 'plate' ? '10px 22px' : '4px 12px',
          backgroundColor:
            size === 'plate' ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            fontFamily: montserratBlack,
            fontWeight: 900,
            fontSize,
            letterSpacing: tracking,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: '#000000',
              WebkitTextStroke: '8px #000000',
              paintOrder: 'stroke fill',
              whiteSpace: 'nowrap',
              letterSpacing: tracking,
            }}
          >
            {text}
          </span>
          <span
            style={{
              position: 'relative',
              color: '#FFFFFF',
              WebkitTextStroke: '0px transparent',
              paintOrder: 'stroke fill',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>
        </span>
      </div>
    </div>
  );
};
