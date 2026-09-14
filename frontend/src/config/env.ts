import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default('/api/v1'),
  VITE_APP_NAME: z.string().default('MY-EPM'),
  VITE_ENABLE_MOCKS: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  appName: parsed.data.VITE_APP_NAME,
  enableMocks: parsed.data.VITE_ENABLE_MOCKS,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
