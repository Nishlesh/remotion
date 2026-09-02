import {describe, expect, it} from 'vitest';
import {
  dropToSpoken,
  fameTest,
  focusStackMustNotLead,
  spokenWordCount,
  validateCta,
  watchWithoutFocusStack,
} from '../src/factory/copy/engine';

describe('copy engine', () => {
  it('rejects founder-led fame', () => {
    const result = fameTest({
      famousEntity: 'GitHub',
      leadsWith: 'founder',
      foundersNamedInHook: true,
    });
    expect(result.ok).toBe(false);
  });

  it('rejects stories that collapse without FocusStack', () => {
    expect(watchWithoutFocusStack(false).ok).toBe(false);
    expect(watchWithoutFocusStack(true).ok).toBe(true);
  });

  it('drop rule keeps only the spoken spine', () => {
    const spoken = dropToSpoken({
      hook: 'GitHub started on a Friday night.',
      humanDetail: 'The first commit was October 19th.',
      constraint: 'Tom still had a day job.',
      choice: 'They met every Saturday.',
      consequence: 'They opened it to everyone.',
      meaning: 'Three twenty-somethings. No outside investment.',
      cta: 'Keep the next Saturday in FocusStack.',
    });
    expect(spokenWordCount(spoken)).toBeGreaterThan(20);
    expect(spoken).toContain('FocusStack');
  });

  it('CTA must callback the story and cannot be a sale', () => {
    const bad = validateCta('Buy now 50% off', ['Saturday']);
    expect(bad.some((c) => !c.ok)).toBe(true);
    const good = validateCta('Keep the next Saturday in FocusStack.', [
      'Saturday',
    ]);
    expect(good.every((c) => c.ok)).toBe(true);
  });

  it('FocusStack cannot lead', () => {
    expect(focusStackMustNotLead('FocusStack helps you ship.').ok).toBe(false);
    expect(
      focusStackMustNotLead('GitHub started on a Friday night.').ok,
    ).toBe(true);
  });
});
