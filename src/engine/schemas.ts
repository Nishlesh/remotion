import {z} from 'zod';

/**
 * Studio-tunable props. Timing, scale, grade, caption, and motion are all
 * live-editable. Stills stay in the locked JSON (swap files, don't fork the engine).
 */
export const kenBurnsSchema = z.object({
  startScale: z.number().min(1).max(1.45),
  endScale: z.number().min(1).max(1.45),
  startX: z.number().min(-240).max(240),
  endX: z.number().min(-240).max(240),
  startY: z.number().min(-240).max(240),
  endY: z.number().min(-240).max(240),
});

export const sceneSchema = z.object({
  sceneId: z.string(),
  timing: z.object({
    durationInFrames: z.number().int().min(30).max(450),
    fadeInFrames: z.number().int().min(0).max(45),
    fadeOutFrames: z.number().int().min(0).max(45),
  }),
  motion: z.object({
    kenBurns: kenBurnsSchema,
    parallax: z.object({
      amount: z.number().min(0).max(90),
    }),
    entrance: z.object({
      damping: z.number().min(8).max(40),
    }),
  }),
  grade: z.object({
    contrast: z.number().min(0.8).max(1.4),
    saturation: z.number().min(0.4).max(1.2),
    brightness: z.number().min(0.7).max(1.2),
    cool: z.number().min(0).max(0.45),
    warm: z.number().min(0).max(0.45),
    grain: z.number().min(0).max(1),
    vignette: z.number().min(0).max(1),
  }),
  caption: z.object({
    text: z.string(),
    kicker: z.string(),
    highlightBias: z.number().min(0).max(1),
  }),
});

export type SceneProps = z.infer<typeof sceneSchema>;

export const episodeSchema = z.object({
  episodeId: z.string(),
  title: z.string(),
});

export type EpisodeProps = z.infer<typeof episodeSchema>;
