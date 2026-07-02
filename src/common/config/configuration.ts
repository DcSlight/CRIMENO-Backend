export default () => ({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  demoMode: (process.env.APP_DEMO ?? '').toLowerCase() === 'true',
});
