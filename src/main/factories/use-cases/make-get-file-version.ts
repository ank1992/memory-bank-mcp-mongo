import { GetFileVersion } from "../../../domain/usecases/file-versioning.js";
import { DbGetFileVersion } from "../../../data/usecases/get-file-version/index.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeGetFileVersion = (): GetFileVersion => {
  const { fileVersionRepository } = getRepositories();
  return new DbGetFileVersion(fileVersionRepository);
};
