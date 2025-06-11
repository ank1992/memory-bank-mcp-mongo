import { DeleteFileController } from "../../../../presentation/controllers/delete-file/delete-file-controller.js";
import { makeDeleteFile } from "../../use-cases/delete-file-factory.js";
import { makeContextChecker } from "../../helpers/context-checker-factory.js";
import { makeDeleteFileValidation } from "./delete-file-validation-factory.js";

export const makeDeleteFileController = () => {
  const validator = makeDeleteFileValidation();
  const deleteFileUseCase = makeDeleteFile();
  const contextChecker = makeContextChecker();

  return new DeleteFileController(
    deleteFileUseCase,
    validator,
    contextChecker
  );
};
