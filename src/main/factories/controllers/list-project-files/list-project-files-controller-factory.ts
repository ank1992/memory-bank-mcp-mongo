import { ListProjectFilesController } from "../../../../presentation/controllers/list-project-files/list-project-files-controller.js";
import { makeListProjectFiles } from "../../use-cases/list-project-files-factory.js";
import { makeContextChecker } from "../../helpers/context-checker-factory.js";
import { makeListProjectFilesValidation } from "./list-project-files-validation-factory.js";

export const makeListProjectFilesController = () => {
  const validator = makeListProjectFilesValidation();
  const listProjectFilesUseCase = makeListProjectFiles();
  const contextChecker = makeContextChecker();

  return new ListProjectFilesController(
    listProjectFilesUseCase,
    validator,
    contextChecker
  );
};
