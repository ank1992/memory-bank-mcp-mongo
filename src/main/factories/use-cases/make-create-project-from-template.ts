import { CreateProjectFromTemplate } from "../../../domain/usecases/project-templates.js";
import { DbCreateProjectFromTemplate } from "../../../data/usecases/create-project-from-template/index.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeCreateProjectFromTemplate = (): CreateProjectFromTemplate => {
  const { projectTemplateRepository, projectRepository, fileRepository } = getRepositories();
  return new DbCreateProjectFromTemplate(projectTemplateRepository, projectRepository, fileRepository);
};
