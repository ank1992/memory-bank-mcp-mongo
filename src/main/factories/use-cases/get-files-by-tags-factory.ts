import { DbGetFilesByTags } from "../../../data/usecases/get-files-by-tags/db-get-files-by-tags.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeGetFilesByTags = () => {
  const { fileRepository } = getRepositories();
  return new DbGetFilesByTags(fileRepository);
};
