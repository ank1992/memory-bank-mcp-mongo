import { RevertFileToVersion } from "../../../domain/usecases/file-versioning.js";
import { DbRevertFileToVersion } from "../../../data/usecases/revert-file-to-version/index.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeRevertFileToVersion = (): RevertFileToVersion => {
  const { fileVersionRepository, fileRepository } = getRepositories();
  return new DbRevertFileToVersion(fileVersionRepository, fileRepository);
};
