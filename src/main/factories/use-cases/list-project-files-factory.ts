import { ListProjectFiles } from "../../../data/usecases/list-project-files/list-project-files.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeListProjectFiles = () => {
  const { fileRepository, projectRepository } = getRepositories();
  return new ListProjectFiles(fileRepository, projectRepository);
};
