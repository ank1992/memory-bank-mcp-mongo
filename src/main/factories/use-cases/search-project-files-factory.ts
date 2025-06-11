import { SearchProjectFiles } from "../../../data/usecases/search-project-files/search-project-files.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeSearchProjectFiles = () => {
  const { fileRepository, projectRepository } = getRepositories();
  return new SearchProjectFiles(fileRepository, projectRepository);
};
