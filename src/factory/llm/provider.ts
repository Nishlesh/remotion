export type CompleteOpts = {
  system?: string;
  json?: boolean;
};

export type LlmProvider = {
  name: string;
  model: string;
  complete: (prompt: string, opts?: CompleteOpts) => Promise<string>;
};

export const defaultModelName = (): string =>
  process.env.FACTORY_MODEL ?? 'gpt-5.6-sol';

export const getProvider = async (): Promise<LlmProvider> => {
  const forceMock =
    process.env.FACTORY_LLM === 'mock' || !process.env.OPENAI_API_KEY;
  if (forceMock) {
    const {mockProvider} = await import('./mock');
    return mockProvider();
  }
  const {openaiProvider} = await import('./openai');
  return openaiProvider();
};
