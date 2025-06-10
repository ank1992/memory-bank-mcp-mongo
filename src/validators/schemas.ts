import { z } from 'zod';

export const ProjectNameSchema = z.string()
  .min(1, 'Project name is required')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Project name contains invalid characters')
  .max(100, 'Project name too long');

export const FileNameSchema = z.string()
  .min(1, 'File name is required')
  .regex(/^[a-zA-Z0-9_.-]+\.(md|txt)$/, 'Invalid file name or extension')
  .max(255, 'File name too long');

export const FileContentSchema = z.string()
  .max(1024 * 1024, 'File content too large'); // 1MB limit

export const ReadFileSchema = z.object({
  projectName: ProjectNameSchema,
  fileName: FileNameSchema,
});

export const WriteFileSchema = z.object({
  projectName: ProjectNameSchema,
  fileName: FileNameSchema,
  content: FileContentSchema,
});

export const UpdateFileSchema = WriteFileSchema;

export const ListProjectFilesSchema = z.object({
  projectName: ProjectNameSchema,
});
