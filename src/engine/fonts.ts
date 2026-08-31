import {loadFont as loadBebasNeue} from '@remotion/google-fonts/BebasNeue';
import {loadFont as loadDMSans} from '@remotion/google-fonts/DMSans';

/**
 * Overlay captions: bold display + body sans.
 * Bebas Neue and DM Sans are both SIL Open Font License (OFL) via Google Fonts.
 */
const bebas = loadBebasNeue('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

const dmSans = loadDMSans('normal', {
  weights: ['400', '500', '700'],
  subsets: ['latin'],
});

export const displayFont = bebas.fontFamily;
export const bodyFont = dmSans.fontFamily;
