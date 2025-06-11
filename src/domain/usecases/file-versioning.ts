import { FileVersion } from "../entities/file-version.js";

export interface GetFileVersions {
  execute(projectName: string, fileName: string): Promise<FileVersion[]>;
}

export interface GetFileVersion {
  execute(projectName: string, fileName: string, version: number): Promise<FileVersion | null>;
}

export interface RevertFileToVersion {
  execute(projectName: string, fileName: string, version: number): Promise<boolean>;
}

export interface CompareFileVersions {
  execute(
    projectName: string, 
    fileName: string, 
    version1: number, 
    version2: number
  ): Promise<{
    version1Content: string;
    version2Content: string;
    differences: Array<{
      type: 'addition' | 'deletion' | 'modification';
      line: number;
      content: string;
    }>;
  } | null>;
}

export interface CleanupOldVersions {
  execute(projectName: string, maxVersionsPerFile?: number): Promise<number>;
}
