import { WriteFile } from "../../../data/usecases/write-file/write-file.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeWriteFile = () => {
  const { fileRepository, projectRepository } = getRepositories();
  return new WriteFile(fileRepository, projectRepository);
};
