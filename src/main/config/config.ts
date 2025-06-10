import { z } from 'zod';

const ConfigSchema = z.object({
  mongodb: z.object({
    connectionString: z.string().url(),
    databaseName: z.string(),
  }),
  server: z.object({
    port: z.number().min(1).max(65535).default(3000),
    host: z.string().default('localhost'),
  }),
  security: z.object({
    maxFileSize: z.number().min(1).default(1024 * 1024), // 1MB
    allowedExtensions: z.array(z.string()).default(['.md', '.txt']),
    rateLimiting: z.object({
      enabled: z.boolean().default(true),
      maxRequests: z.number().min(1).default(100),
      windowMs: z.number().min(1000).default(60000), // 1 minute
    }),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('MONGODB_URL environment variable is required');
  }

  const config = {
    mongodb: {
      connectionString: mongoUrl,
      databaseName: process.env.MONGODB_DB || 'memory_bank',
    },
    server: {
      port: parseInt(process.env.PORT || '3000'),
      host: process.env.HOST || 'localhost',
    },
    security: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '1048576'),
      allowedExtensions: process.env.ALLOWED_EXTENSIONS?.split(',') || ['.md', '.txt'],
      rateLimiting: {
        enabled: process.env.RATE_LIMITING !== 'false',
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
      },
    },
  };
  return ConfigSchema.parse(config);
}
