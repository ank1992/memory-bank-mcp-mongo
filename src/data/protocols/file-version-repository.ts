import { FileVersion, VersioningConfig } from "../../domain/entities/file-version.js";

export interface FileVersionRepository {
  // Store a new version when file is updated
  createVersion(fileVersion: Omit<FileVersion, 'id'>): Promise<FileVersion>;
  
  // Get all versions for a file
  getVersions(projectName: string, fileName: string): Promise<FileVersion[]>;
  
  // Get specific version
  getVersion(projectName: string, fileName: string, version: number): Promise<FileVersion | null>;
  
  // Get latest version number for a file
  getLatestVersionNumber(projectName: string, fileName: string): Promise<number>;
  
  // Cleanup old versions based on config
  cleanupOldVersions(projectName: string, fileName: string, config: VersioningConfig): Promise<number>;
  
  // Delete all versions for a file
  deleteAllVersions(projectName: string, fileName: string): Promise<boolean>;
  
  // Delete all versions for a project
  deleteProjectVersions(projectName: string): Promise<boolean>;
}
