import {z} from 'zod';
import {
  HEIGHT,
  MAX_DURATION_SEC,
  MIN_DURATION_SEC,
  SAMPLE_RATE,
  WIDTH,
} from '../../engine/constants';

export const STAGES = [
  'discover',
  'score',
  'research',
  'script',
  'audio',
  'storyboard',
  'assets',
  'render',
  'qa',
  'package',
  'publish',
] as const;

export type StageName = (typeof STAGES)[number];

export const COPY_SPINE = [
  'famous_entity',
  'unexpected_beginning',
  'human_detail',
  'constraint',
  'choice',
  'consequence',
  'realization',
  'viewer',
  'focusstack',
] as const;

export type CopySpineBeat = (typeof COPY_SPINE)[number];

export const GATE_FILES = {
  factApproved: 'FACT_APPROVED',
  narrationLocked: 'NARRATION_LOCKED',
  publishGo: 'PUBLISH_GO',
} as const;

export const sourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  publisher: z.string().optional(),
  accessed: z.string().optional(),
  notes: z.string().optional(),
});

export const discoveryCandidateSchema = z.object({
  famousEntity: z.string(),
  workingTitle: z.string(),
  oneLiner: z.string(),
  whyFamous: z.string(),
  unexpectedBeginning: z.string(),
  watchWithoutFocusStack: z.boolean(),
  notes: z.string().optional(),
  sources: z.array(sourceSchema).default([]),
});

export const discoverySchema = z.object({
  slug: z.string(),
  createdAt: z.string(),
  query: z.string().optional(),
  promptPath: z.string(),
  candidates: z.array(discoveryCandidateSchema),
  rejected: z.array(
    z.object({
      famousEntity: z.string(),
      reason: z.string(),
    }),
  ),
});

export const scoreSchema = z.object({
  slug: z.string(),
  famousEntity: z.string(),
  total: z.number().min(0).max(100),
  pass: z.boolean(),
  threshold: z.literal(70),
  pivotal: z.number().min(0).max(5),
  sourceCount: z.number().int().min(0),
  fitsFiftySeconds: z.boolean(),
  watchWithoutFocusStack: z.boolean(),
  fameTestPass: z.boolean(),
  breakdown: z.object({
    fame: z.number(),
    unexpectedBeginning: z.number(),
    humanStakes: z.number(),
    visualSpine: z.number(),
    runtimeFit: z.number(),
  }),
  reasons: z.array(z.string()),
  sources: z.array(sourceSchema),
});

export const researchFactSchema = z.object({
  id: z.string(),
  claim: z.string(),
  sourceIds: z.array(z.string()).min(1),
  spine: z.enum(COPY_SPINE).optional(),
});

export const researchSchema = z.object({
  slug: z.string(),
  famousEntity: z.string(),
  promptPath: z.string(),
  sources: z.array(sourceSchema.extend({id: z.string()})),
  facts: z.array(researchFactSchema),
  unknown: z.array(z.string()),
  inventedFactsForbidden: z.literal(true),
});

export const hookSchema = z.object({
  id: z.string(),
  text: z.string(),
  selected: z.boolean().optional(),
});

export const scriptSchema = z.object({
  slug: z.string(),
  famousEntity: z.string(),
  selectedHookId: z.string(),
  hooks: z.array(hookSchema).min(2).max(4),
  spine: z.object({
    famous_entity: z.string(),
    unexpected_beginning: z.string(),
    human_detail: z.string(),
    constraint: z.string(),
    choice: z.string(),
    consequence: z.string(),
    realization: z.string(),
    viewer: z.string(),
    focusstack: z.string(),
  }),
  spoken: z.string(),
  spokenWordCount: z.number().int(),
  lines: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      spine: z.enum(COPY_SPINE).optional(),
    }),
  ),
  cta: z.string(),
  dropRuleApplied: z.literal(true),
  factApproved: z.literal(true),
});

export const wordStampSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});

export const timestampsSchema = z.object({
  episode: z.string(),
  engine: z.string(),
  voice: z.string(),
  speed: z.number(),
  lang: z.string().optional(),
  sampleRate: z.number(),
  gapSeconds: z.number(),
  totalDuration: z.number(),
  fixture: z.boolean().optional(),
  lines: z.array(
    z.object({
      i: z.number(),
      text: z.string(),
      file: z.string(),
      start: z.number(),
      end: z.number(),
      duration: z.number(),
      words: z.array(wordStampSchema),
    }),
  ),
});

export const beatSchema = z.object({
  id: z.string(),
  index: z.number().int().min(1),
  startSec: z.number().min(0),
  endSec: z.number().positive(),
  voiceoverLineId: z.string(),
  visual: z.string(),
  stillId: z.string(),
  osLockup: z
    .object({
      text: z.string(),
      y: z.number(),
      size: z.enum(['large', 'plate']).optional(),
    })
    .nullable()
    .optional(),
  identityPlate: z.string().nullable().optional(),
  sourcePreference: z
    .enum(['wikimedia', 'unsplash', 'pexels', 'pixabay', 'generate'])
    .optional(),
});

export const identityPlateSchema = z.object({
  personName: z.string(),
  stillId: z.string(),
  appearances: z.number().int().min(2),
  notes: z.string().optional(),
});

export const storyboardSchema = z.object({
  slug: z.string(),
  narrationLocked: z.literal(true),
  durationSec: z.number(),
  beats: z.array(beatSchema),
  identityPlates: z.array(identityPlateSchema),
});

export const licenseRecordSchema = z.object({
  stillId: z.string(),
  file: z.string(),
  source: z.enum([
    'wikimedia',
    'unsplash',
    'pexels',
    'pixabay',
    'generate',
    'fixture',
  ]),
  license: z.string(),
  author: z.string().optional(),
  url: z.string().optional(),
  query: z.string().optional(),
  generated: z.boolean().optional(),
  coverCropped: z.literal(true),
  width: z.literal(WIDTH),
  height: z.literal(HEIGHT),
});

export const qaIssueSchema = z.object({
  code: z.string(),
  severity: z.enum(['fail', 'warn']),
  message: z.string(),
});

export const qaReportSchema = z.object({
  slug: z.string(),
  ok: z.boolean(),
  durationSec: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  issues: z.array(qaIssueSchema),
});

export const episodeMetaSchema = z.object({
  slug: z.string(),
  kind: z.enum(['production', 'fixture']).default('production'),
  channel: z.literal('Before It Was Famous'),
  handle: z.literal('@beforeitwasfamous'),
  title: z.string(),
  famousEntity: z.string(),
  compositionId: z.string(),
  status: z.enum(STAGES).optional(),
});

export type EpisodeMeta = z.infer<typeof episodeMetaSchema>;
export type DiscoveryDoc = z.infer<typeof discoverySchema>;
export type ScoreDoc = z.infer<typeof scoreSchema>;
export type ResearchDoc = z.infer<typeof researchSchema>;
export type ScriptDoc = z.infer<typeof scriptSchema>;
export type TimestampsDoc = z.infer<typeof timestampsSchema>;
export type StoryboardDoc = z.infer<typeof storyboardSchema>;
export type LicenseRecord = z.infer<typeof licenseRecordSchema>;
export type QaIssue = z.infer<typeof qaIssueSchema>;
export type QaReport = z.infer<typeof qaReportSchema>;
export type WordStamp = z.infer<typeof wordStampSchema>;

export const COVER_CROP = {width: WIDTH, height: HEIGHT} as const;
export {WIDTH, HEIGHT, MIN_DURATION_SEC, MAX_DURATION_SEC, SAMPLE_RATE};
