import { z } from 'zod';

export const FileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  content: z.string(),
  projectName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  size: z.number().min(0),
  checksum: z.string().optional(),
  metadata: z.object({
    encoding: z.string().default('utf-8'),
    mimeType: z.string().default('text/plain'),
    tags: z.array(z.string()).optional(),
    wordCount: z.number().optional(),
    lineCount: z.number().optional(),
    keywords: z.array(z.string()).optional(),
    summary: z.string().optional(),
    version: z.number().optional(),
  }).optional(),
});

export type File = z.infer<typeof FileSchema>;

// Legacy type alias for backward compatibility
export type FileContent = string;
