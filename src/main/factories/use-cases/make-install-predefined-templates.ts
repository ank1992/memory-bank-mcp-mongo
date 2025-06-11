import { InstallPredefinedTemplates } from "../../../domain/usecases/project-templates.js";
import { DbInstallPredefinedTemplates } from "../../../data/usecases/install-predefined-templates/index.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeInstallPredefinedTemplates = (): InstallPredefinedTemplates => {
  const { projectTemplateRepository } = getRepositories();
  return new DbInstallPredefinedTemplates(projectTemplateRepository);
};
