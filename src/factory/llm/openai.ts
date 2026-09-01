import {defaultModelName, type LlmProvider} from './provider';

/**
 * OpenAI-compatible chat interface. Default model name is gpt-5.6-sol.
 * Key comes from OPENAI_API_KEY only — never from a committed file.
 */
export const openaiProvider = (): LlmProvider => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  const model = defaultModelName();
  const base = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
  );

  return {
    name: 'openai',
    model,
    complete: async (prompt, opts) => {
      const response = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            opts?.system
              ? {role: 'system', content: opts.system}
              : {
                  role: 'system',
                  content:
                    'You never invent facts. If a claim is not in the provided sources, say so.',
                },
            {role: 'user', content: prompt},
          ],
        }),
      });
      if (!response.ok) {
        throw new Error(`OpenAI error ${response.status}: ${await response.text()}`);
      }
      const json = (await response.json()) as {
        choices?: {message?: {content?: string}}[];
      };
      return json.choices?.[0]?.message?.content ?? '';
    },
  };
};
