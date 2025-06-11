import { CompareFileVersions } from "../../../domain/usecases/file-versioning.js";
import { DbCompareFileVersions } from "../../../data/usecases/compare-file-versions/index.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeCompareFileVersions = (): CompareFileVersions => {
  const { fileVersionRepository } = getRepositories();
  return new DbCompareFileVersions(fileVersionRepository);
};
