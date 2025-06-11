import { GetFilesByTagsController } from "../../../../presentation/controllers/get-files-by-tags/get-files-by-tags-controller.js";
import { makeGetFilesByTags } from "../../use-cases/get-files-by-tags-factory.js";
import { makeContextChecker } from "../../helpers/context-checker-factory.js";
import { makeGetFilesByTagsValidation } from "./get-files-by-tags-validation-factory.js";

export const makeGetFilesByTagsController = () => {
  const validator = makeGetFilesByTagsValidation();
  const getFilesByTagsUseCase = makeGetFilesByTags();
  const contextChecker = makeContextChecker();

  return new GetFilesByTagsController(
    getFilesByTagsUseCase,
    validator,
    contextChecker
  );
};
