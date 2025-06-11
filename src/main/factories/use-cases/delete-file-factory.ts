import { DbDeleteFile } from "../../../data/usecases/delete-file/db-delete-file.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeDeleteFile = () => {
  const { fileRepository } = getRepositories();
  return new DbDeleteFile(fileRepository);
};
