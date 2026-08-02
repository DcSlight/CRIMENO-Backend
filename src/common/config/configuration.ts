export default () => ({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  demoMode: (process.env.APP_DEMO ?? '').toLowerCase() === 'true',
  analyticsJsonPath:
    process.env.ANALYTICS_JSON_PATH ?? '../CRIMENO-Model/analytics.json',
  modelLogsDir: process.env.MODEL_LOGS_DIR ?? '../CRIMENO-Model/logs',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-flash-lite-latest',
    timeoutMs: process.env.GEMINI_TIMEOUT_MS
      ? Number(process.env.GEMINI_TIMEOUT_MS)
      : 20_000,
    maxOutputTokens: process.env.GEMINI_MAX_OUTPUT_TOKENS
      ? Number(process.env.GEMINI_MAX_OUTPUT_TOKENS)
      : 400,
    // Dry-run switch: when false, GeminiClient logs the assembled prompt but
    // never makes the real (billable) API call. Defaults to true so the
    // assistant works out of the box; set SEND_PROMPT=false while iterating
    // on prompt content to avoid burning quota.
    sendPrompt: (process.env.SEND_PROMPT ?? 'true').toLowerCase() === 'true',
  },
});
