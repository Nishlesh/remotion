import {z} from 'zod';
import type {EpisodeSpec} from './types';

const stillLayerSchema = z.object({
  id: z.string(),
  src: z.string(),
  x: z.number(),
  y: z.number(),
  scale: z.number(),
  opacity: z.number(),
  depth: z.number(),
  blend: z.enum(['normal', 'screen', 'soft-light']).optional(),
  invertParallax: z.boolean().optional(),
  shiftX: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  fromFrame: z.number().int().optional(),
  toFrame: z.number().int().optional(),
  fadeInFrames: z.number().int().optional(),
  fadeOutFrames: z.number().int().optional(),
  objectPosition: z.string().optional(),
  transformOrigin: z.string().optional(),
  objectFit: z.enum(['fill', 'cover', 'contain']).optional(),
});

const gradeSchema = z.object({
  contrast: z.number(),
  saturation: z.number(),
  brightness: z.number(),
  cool: z.number(),
  vignette: z.number(),
});

/** JSON a factory can emit. Validated once when an episode module loads. */
export const episodeJsonSchema = z.object({
  id: z.string(),
  title: z.string(),
  compositionId: z.string(),
  targetDurationSec: z.number().min(25).max(50),
  fonts: z
    .object({
      display: z.string(),
      body: z.string(),
    })
    .optional(),
  audio: z
    .object({
      voiceover: z.string().nullable().optional(),
      bed: z.string().nullable().optional(),
    })
    .optional(),
  grade: gradeSchema,
  captionsEnabled: z.boolean().optional(),
  voiceover: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      approximateDurationSec: z.number().positive(),
      audioFile: z.string().optional(),
    }),
  ),
  scenes: z.array(
    z.object({
      id: z.string(),
      voiceoverLineId: z.string(),
      durationInFrames: z.number().int().positive(),
      fadeInFrames: z.number().int().optional(),
      fadeOutFrames: z.number().int().optional(),
      captions: z.object({
        text: z.string(),
        kicker: z.string(),
        highlightBias: z.number().min(0).max(1),
      }),
      motion: z.object({
        kenBurns: z.object({
          startScale: z.number(),
          endScale: z.number(),
          startX: z.number(),
          endX: z.number(),
          startY: z.number(),
          endY: z.number(),
        }),
        parallax: z.object({amount: z.number()}),
        entrance: z.object({damping: z.number()}),
      }),
      grade: gradeSchema.partial().optional(),
      osLockup: z
        .object({
          text: z.string(),
          y: z.number(),
          size: z.enum(['large', 'plate']).optional(),
        })
        .nullable()
        .optional(),
      stills: z.object({
        bg: stillLayerSchema,
        layers: z.array(stillLayerSchema),
      }),
    }),
  ),
});

export const parseEpisode = (data: unknown): EpisodeSpec =>
  episodeJsonSchema.parse(data);
