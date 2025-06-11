import { InstallPredefinedTemplatesController } from "../../../presentation/controllers/install-predefined-templates/index.js";
import { makeInstallPredefinedTemplates } from "../use-cases/make-install-predefined-templates.js";

export const makeInstallPredefinedTemplatesController = () => {
  return new InstallPredefinedTemplatesController(makeInstallPredefinedTemplates());
};
