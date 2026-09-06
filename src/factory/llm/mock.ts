import type {LlmProvider} from './provider';
import {defaultModelName} from './provider';

/**
 * Local mock. Never invents facts — returns structured stubs that tell
 * the operator to fill research from sources.
 */
export const mockProvider = (): LlmProvider => ({
  name: 'mock',
  model: 'mock-local',
  complete: async (prompt: string) => {
    const lower = prompt.toLowerCase();
    if (lower.includes('discover')) {
      return JSON.stringify({
        candidates: [],
        rejected: [],
        note: 'Mock LLM. Do not invent famous-entity candidates. Fill discovery.json from real sources.',
      });
    }
    if (lower.includes('research')) {
      return JSON.stringify({
        facts: [],
        unknown: ['Mock LLM cannot cite sources. Do not invent facts.'],
        inventedFactsForbidden: true,
      });
    }
    if (lower.includes('script') || lower.includes('hook')) {
      return JSON.stringify({
        refused: true,
        reason: 'Mock LLM will not write production scripts. FACT_APPROVED research must drive the copy engine.',
      });
    }
    return JSON.stringify({
      model: defaultModelName(),
      stub: true,
      message: 'Mock provider. Set OPENAI_API_KEY to use the live interface.',
    });
  },
});
