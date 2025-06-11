import { GetFileVersions } from "../../../domain/usecases/file-versioning.js";
import { DbGetFileVersions } from "../../../data/usecases/get-file-versions/index.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeGetFileVersions = (): GetFileVersions => {
  const { fileVersionRepository } = getRepositories();
  return new DbGetFileVersions(fileVersionRepository);
};
