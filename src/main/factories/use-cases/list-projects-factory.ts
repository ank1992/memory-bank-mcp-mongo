import { ListProjects } from "../../../data/usecases/list-projects/list-projects.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeListProjects = () => {
  const { projectRepository } = getRepositories();
  return new ListProjects(projectRepository);
};
