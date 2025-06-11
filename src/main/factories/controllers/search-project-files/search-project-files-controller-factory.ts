import { SearchProjectFilesController } from "../../../../presentation/controllers/search-project-files/search-project-files-controller.js";
import { makeSearchProjectFiles } from "../../use-cases/search-project-files-factory.js";
import { makeContextChecker } from "../../helpers/context-checker-factory.js";
import { makeSearchProjectFilesValidation } from "./search-project-files-validation-factory.js";

export const makeSearchProjectFilesController = () => {
  const validator = makeSearchProjectFilesValidation();
  const searchProjectFilesUseCase = makeSearchProjectFiles();
  const contextChecker = makeContextChecker();

  return new SearchProjectFilesController(
    searchProjectFilesUseCase,
    validator,
    contextChecker
  );
};
