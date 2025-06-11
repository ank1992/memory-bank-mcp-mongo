import { DbDeleteProject } from "../../../data/usecases/delete-project/db-delete-project.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeDeleteProject = () => {
  const { projectRepository } = getRepositories();
  return new DbDeleteProject(projectRepository);
};
