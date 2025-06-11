import { z } from 'zod';

export const TemplateFileSchema = z.object({
  path: z.string(), // Relative path within template
  content: z.string(),
  isVariable: z.boolean().default(false), // Contains template variables
  description: z.string().optional(),
});

export const ProjectTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.string(), // e.g., 'documentation', 'code', 'notes'
  version: z.string().default('1.0.0'),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  files: z.array(TemplateFileSchema),
  variables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    defaultValue: z.string().optional(),
    required: z.boolean().default(false),
    type: z.enum(['string', 'number', 'boolean', 'date']).default('string'),
  })).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TemplateFile = z.infer<typeof TemplateFileSchema>;
export type ProjectTemplate = z.infer<typeof ProjectTemplateSchema>;

// Input for creating project from template
export const CreateFromTemplateSchema = z.object({
  templateId: z.string().uuid(),
  projectName: z.string(),
  variables: z.record(z.string(), z.any()).default({}), // Variable substitutions
});

export type CreateFromTemplateInput = z.infer<typeof CreateFromTemplateSchema>;
