import {continueRender, delayRender} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Montserrat';

/**
 * Locked Karaoke Highlight captions use Montserrat Black (weight 900).
 * SIL Open Font License via Google Fonts. Do not use DM Sans or Bebas Neue here.
 */
const montserrat = loadFont('normal', {
  weights: ['900'],
  subsets: ['latin'],
});

const fontHandle = delayRender('Montserrat Black 900');
void montserrat.waitUntilDone().then(() => continueRender(fontHandle));

export const montserratBlack = montserrat.fontFamily;
