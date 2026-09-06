/**
 * Copy engine (hard lock).
 * FAMOUS ENTITY → unexpected beginning → human detail → constraint →
 * choice → consequence → realization → viewer → FocusStack.
 */

export const COPY_CADENCE = {
  minClauseWords: 3,
  maxClauseWords: 12,
  spokenTargetMin: 80,
  spokenTargetMax: 100,
  spokenHardMax: 120,
} as const;

const SALE_PRICE =
  /\$\d|\d+\s*%\s*off|discount|limited time|subscribe now|buy now|sale price|free trial/i;

const AD_TELL = /\b(sponsored|use code|promo code|click the link)\b/i;

export type FameLead = 'product' | 'founder';

export type CopyCheck = {
  ok: boolean;
  code: string;
  message: string;
};

export const splitClauses = (text: string): string[] =>
  text
    .split(/(?<=[.!?,—–])\s+|\n+/)
    .map((c) => c.trim())
    .filter(Boolean);

export const spokenWords = (text: string): string[] =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean);

export const spokenWordCount = (text: string): number => spokenWords(text).length;

export const fameTest = (input: {
  famousEntity: string;
  leadsWith: FameLead;
  foundersNamedInHook: boolean;
}): CopyCheck => {
  if (!input.famousEntity.trim()) {
    return {
      ok: false,
      code: 'fame_missing_entity',
      message: 'Famous product/company must lead. Unknown founders cannot lead.',
    };
  }
  if (input.leadsWith === 'founder' || input.foundersNamedInHook) {
    return {
      ok: false,
      code: 'fame_founder_lead',
      message:
        'Fame test failed: unknown founders cannot lead. Famous product/company leads.',
    };
  }
  return {ok: true, code: 'fame_ok', message: 'Famous entity leads.'};
};

export const watchWithoutFocusStack = (watchableWithoutProduct: boolean): CopyCheck => {
  if (!watchableWithoutProduct) {
    return {
      ok: false,
      code: 'focusstack_is_the_story',
      message:
        'Would someone watch this if FocusStack did not exist? If no, reject the story.',
    };
  }
  return {
    ok: true,
    code: 'story_stands_alone',
    message: 'Story stands without FocusStack.',
  };
};

export const validateCadence = (spoken: string): CopyCheck[] => {
  const issues: CopyCheck[] = [];
  const count = spokenWordCount(spoken);
  if (count < 20) {
    issues.push({
      ok: false,
      code: 'spoken_too_short',
      message: `Spoken script is ${count} words; production target is ~80–100.`,
    });
  } else if (count > COPY_CADENCE.spokenHardMax) {
    issues.push({
      ok: false,
      code: 'spoken_too_long',
      message: `Spoken script is ${count} words; hard max ${COPY_CADENCE.spokenHardMax} (target 80–100).`,
    });
  }
  const clauses = splitClauses(spoken);
  for (const clause of clauses) {
    const n = spokenWordCount(clause);
    if (n === 0) {
      continue;
    }
    if (n > COPY_CADENCE.maxClauseWords + 4) {
      issues.push({
        ok: false,
        code: 'clause_too_long',
        message: `Clause exceeds cadence (${n} words): "${clause}"`,
      });
    }
  }
  if (issues.length === 0) {
    issues.push({ok: true, code: 'cadence_ok', message: 'Cadence within lock.'});
  }
  return issues;
};

export const validateCta = (
  cta: string,
  storyTokens: string[],
): CopyCheck[] => {
  const out: CopyCheck[] = [];
  if (SALE_PRICE.test(cta) || SALE_PRICE.test(storyTokens.join(' '))) {
    out.push({
      ok: false,
      code: 'sale_price_ending',
      message: 'No sale-price ending. CTA callbacks THIS story.',
    });
  }
  if (AD_TELL.test(cta)) {
    out.push({
      ok: false,
      code: 'cta_is_ad',
      message: 'FocusStack is a Level-2 natural close, never an ad.',
    });
  }
  const lower = cta.toLowerCase();
  if (!lower.includes('focusstack') && !lower.includes('focus stack')) {
    out.push({
      ok: false,
      code: 'cta_missing_focusstack',
      message: 'Close must mention FocusStack as a natural Level-2 close.',
    });
  }
  const callback = storyTokens.some(
    (token) => token.length > 3 && lower.includes(token.toLowerCase()),
  );
  if (!callback) {
    out.push({
      ok: false,
      code: 'cta_no_story_callback',
      message: 'CTA must callback THIS story (constraint, choice, or object).',
    });
  }
  if (out.length === 0) {
    out.push({ok: true, code: 'cta_ok', message: 'CTA callbacks the story.'});
  }
  return out;
};

export type DropKeep = {
  hook: string;
  humanDetail: string;
  constraint: string;
  choice: string;
  consequence: string;
  meaning: string;
  cta: string;
};

/** Spoken script keeps only these. Everything else is dropped. */
export const dropToSpoken = (keep: DropKeep): string => {
  return [
    keep.hook,
    keep.humanDetail,
    keep.constraint,
    keep.choice,
    keep.consequence,
    keep.meaning,
    keep.cta,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
};

export const focusStackMustNotLead = (spoken: string): CopyCheck => {
  const first = spoken.trim().slice(0, 80).toLowerCase();
  if (first.includes('focusstack') || first.startsWith('focus stack')) {
    return {
      ok: false,
      code: 'focusstack_leads',
      message: 'FocusStack cannot lead. It is a Level-2 close, never the hook.',
    };
  }
  return {ok: true, code: 'focusstack_close_only', message: 'FocusStack does not lead.'};
};
