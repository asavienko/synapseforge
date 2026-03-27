/**
 * Resolve the platform OpenAI API key from available env vars.
 * Returns an array of available keys to try (for 401 retry scenarios).
 */
export function getPlatformOpenAIKeys(): string[] {
  const keys: string[] = [];
  if (process.env.OPENHELIX_OPENAI_KEY) keys.push(process.env.OPENHELIX_OPENAI_KEY);
  if (process.env.OPENAI_API_KEY) keys.push(process.env.OPENAI_API_KEY);
  return [...new Set(keys)];
}

/** Convenience: returns the first available key or undefined */
export function getPlatformOpenAIKey(): string | undefined {
  return getPlatformOpenAIKeys()[0];
}
