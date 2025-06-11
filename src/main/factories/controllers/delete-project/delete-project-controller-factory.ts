import { DeleteProjectController } from "../../../../presentation/controllers/delete-project/delete-project-controller.js";
import { makeDeleteProject } from "../../use-cases/delete-project-factory.js";
import { makeContextChecker } from "../../helpers/context-checker-factory.js";
import { makeDeleteProjectValidation } from "./delete-project-validation-factory.js";

export const makeDeleteProjectController = () => {
  const validator = makeDeleteProjectValidation();
  const deleteProjectUseCase = makeDeleteProject();
  const contextChecker = makeContextChecker();

  return new DeleteProjectController(
    deleteProjectUseCase,
    validator,
    contextChecker
  );
};
