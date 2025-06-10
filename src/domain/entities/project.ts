import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  fileCount: z.number().min(0),
  totalSize: z.number().min(0),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    owner: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Legacy type alias for backward compatibility
export type ProjectName = string;
