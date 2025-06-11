import { getRepositories } from "../repositories/repositories-factory.js";
import { DbCleanupOldVersions } from "../../../data/usecases/cleanup-old-versions/db-cleanup-old-versions.js";
import { CleanupOldVersions } from "../../../domain/usecases/file-versioning.js";

export const makeCleanupOldVersions = (): CleanupOldVersions => {
  const { fileVersionRepository, fileRepository } = getRepositories();
  return new DbCleanupOldVersions(fileVersionRepository, fileRepository);
};
