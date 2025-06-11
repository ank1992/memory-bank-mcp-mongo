import { File } from "../../domain/entities/index.js";

export interface FileRepository {
  listFiles(projectName: string): Promise<File[]>;
  loadFile(projectName: string, fileName: string): Promise<File | null>;
  writeFile(
    projectName: string,
    fileName: string,
    content: string
  ): Promise<File | null>;
  updateFile(
    projectName: string,
    fileName: string,
    content: string
  ): Promise<File | null>;
  deleteFile(projectName: string, fileName: string): Promise<boolean>;
  searchFiles(projectName: string, query: string): Promise<File[]>;
  getFilesByTags(projectName: string, tags: string[]): Promise<File[]>;
  getProjectStats(projectName: string): Promise<{ fileCount: number; totalSize: number }>;
}
