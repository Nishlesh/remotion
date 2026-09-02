import {describe, expect, it} from 'vitest';
import {hasGate} from '../src/factory/paths';
import {publishStage} from '../src/factory/stages/publish';
import {scriptStage} from '../src/factory/stages/script';

describe('human gates', () => {
  it('fixture has FACT_APPROVED and NARRATION_LOCKED', () => {
    expect(hasGate('_fixture-pipeline', 'factApproved')).toBe(true);
    expect(hasGate('_fixture-pipeline', 'narrationLocked')).toBe(true);
    expect(hasGate('_fixture-pipeline', 'publishGo')).toBe(false);
  });

  it('publish refuses without PUBLISH_GO', async () => {
    await expect(publishStage('_fixture-pipeline')).rejects.toThrow(/Publish refused/);
  });

  it('script stage reads the locked fixture script', async () => {
    const doc = await scriptStage('_fixture-pipeline');
    expect(doc.factApproved).toBe(true);
    expect(doc.cta).toContain('FocusStack');
  });
});
