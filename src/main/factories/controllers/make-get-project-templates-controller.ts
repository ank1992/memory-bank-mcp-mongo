import { GetProjectTemplatesController } from "../../../presentation/controllers/get-project-templates/get-project-templates-controller.js";
import { makeGetProjectTemplates } from "../use-cases/make-get-project-templates.js";

export const makeGetProjectTemplatesController = () => {
  return new GetProjectTemplatesController(makeGetProjectTemplates());
};
