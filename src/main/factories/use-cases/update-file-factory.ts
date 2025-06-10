import { UpdateFile } from "../../../data/usecases/update-file/update-file.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeUpdateFile = () => {
  const { fileRepository, projectRepository } = getRepositories();
  return new UpdateFile(fileRepository, projectRepository);
};
