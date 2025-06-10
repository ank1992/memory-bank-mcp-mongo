import { ReadFile } from "../../../data/usecases/read-file/read-file.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeReadFile = () => {
  const { fileRepository, projectRepository } = getRepositories();
  return new ReadFile(fileRepository, projectRepository);
};
