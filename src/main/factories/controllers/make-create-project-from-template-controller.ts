import { CreateProjectFromTemplateController } from "../../../presentation/controllers/create-project-from-template/index.js";
import { makeCreateProjectFromTemplate } from "../use-cases/make-create-project-from-template.js";

export const makeCreateProjectFromTemplateController = () => {
  return new CreateProjectFromTemplateController(makeCreateProjectFromTemplate());
};
