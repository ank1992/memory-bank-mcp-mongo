import { GetFileVersion } from "../../../domain/usecases/file-versioning.js";
import { FileVersionRepository } from "../../protocols/file-version-repository.js";
import { FileVersion } from "../../../domain/entities/file-version.js";

export class DbGetFileVersion implements GetFileVersion {
  constructor(
    private readonly fileVersionRepository: FileVersionRepository
  ) {}

  async execute(projectName: string, fileName: string, version: number): Promise<FileVersion | null> {
    return await this.fileVersionRepository.getVersion(projectName, fileName, version);
  }
}
