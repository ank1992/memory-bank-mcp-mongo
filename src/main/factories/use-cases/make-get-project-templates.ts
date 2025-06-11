import { GetProjectTemplates } from "../../../domain/usecases/project-templates.js";
import { DbGetProjectTemplates } from "../../../data/usecases/get-project-templates/index.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeGetProjectTemplates = (): GetProjectTemplates => {
  const { projectTemplateRepository } = getRepositories();
  return new DbGetProjectTemplates(projectTemplateRepository);
};
