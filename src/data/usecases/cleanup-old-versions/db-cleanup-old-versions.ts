import { CleanupOldVersions } from "../../../domain/usecases/file-versioning.js";
import { FileVersionRepository } from "../../protocols/file-version-repository.js";
import { FileRepository } from "../../protocols/file-repository.js";
import { VersioningConfig } from "../../../domain/entities/file-version.js";

export class DbCleanupOldVersions implements CleanupOldVersions {
  constructor(
    private readonly fileVersionRepository: FileVersionRepository,
    private readonly fileRepository: FileRepository
  ) {}

  async execute(projectName: string, maxVersionsPerFile?: number): Promise<number> {
    const config: VersioningConfig = {
      maxVersionsPerFile: maxVersionsPerFile || 10,
      autoCleanupOldVersions: true,
      preserveVersionsForDays: 30
    };

    // Get all files in the project
    const files = await this.fileRepository.listFiles(projectName);
    let totalCleaned = 0;

    // Cleanup versions for each file
    for (const file of files) {
      try {
        const cleaned = await this.fileVersionRepository.cleanupOldVersions(
          projectName, 
          file.name, 
          config
        );
        totalCleaned += cleaned;
      } catch (error) {
        console.warn(`Failed to cleanup versions for ${file.name}:`, error);
      }
    }

    return totalCleaned;
  }
}
