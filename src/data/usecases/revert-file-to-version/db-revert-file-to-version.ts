import { RevertFileToVersion } from "../../../domain/usecases/file-versioning.js";
import { FileVersionRepository } from "../../protocols/file-version-repository.js";
import { FileRepository } from "../../protocols/file-repository.js";

export class DbRevertFileToVersion implements RevertFileToVersion {
  constructor(
    private readonly fileVersionRepository: FileVersionRepository,
    private readonly fileRepository: FileRepository
  ) {}

  async execute(projectName: string, fileName: string, version: number): Promise<boolean> {
    // Get the specific version
    const targetVersion = await this.fileVersionRepository.getVersion(projectName, fileName, version);
    
    if (!targetVersion) {
      return false;
    }

    // Update the current file with the version content
    const updatedFile = await this.fileRepository.updateFile(
      projectName,
      fileName,
      targetVersion.content
    );

    return updatedFile !== null;
  }
}
