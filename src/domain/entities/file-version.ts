import { z } from 'zod';

export const FileVersionSchema = z.object({
  id: z.string().uuid(),
  fileId: z.string().uuid(), // Reference to original file
  projectName: z.string(),
  fileName: z.string(),
  content: z.string(),
  version: z.number().int().positive(),
  checksum: z.string(),
  size: z.number().min(0),
  createdAt: z.date(),
  metadata: z.object({
    encoding: z.string().default('utf-8'),
    mimeType: z.string().default('text/plain'),
    tags: z.array(z.string()).optional(),
    wordCount: z.number().optional(),
    lineCount: z.number().optional(),
    keywords: z.array(z.string()).optional(),
    summary: z.string().optional(),
    changeDescription: z.string().optional(), // What changed in this version
    isAutoSave: z.boolean().default(false), // Was this an automatic save?
  }).optional(),
});

export type FileVersion = z.infer<typeof FileVersionSchema>;

// Configuration for versioning behavior
export interface VersioningConfig {
  maxVersionsPerFile: number;
  autoCleanupOldVersions: boolean;
  preserveVersionsForDays: number;
}
