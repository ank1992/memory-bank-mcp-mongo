import { GetFileVersions } from "../../../domain/usecases/file-versioning.js";
import { FileVersionRepository } from "../../protocols/file-version-repository.js";
import { FileVersion } from "../../../domain/entities/file-version.js";

export class DbGetFileVersions implements GetFileVersions {
  constructor(
    private readonly fileVersionRepository: FileVersionRepository
  ) {}

  async execute(projectName: string, fileName: string): Promise<FileVersion[]> {
    return await this.fileVersionRepository.getVersions(projectName, fileName);
  }
}
