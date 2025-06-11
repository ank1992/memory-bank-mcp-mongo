import { WriteController } from "../../../../presentation/controllers/write/write-controller.js";
import { makeWriteFile } from "../../use-cases/write-file-factory.js";
import { makeContextChecker } from "../../helpers/context-checker-factory.js";
import { makeWriteValidation } from "./write-validation-factory.js";

export const makeWriteController = () => {
  const validator = makeWriteValidation();
  const writeFileUseCase = makeWriteFile();
  const contextChecker = makeContextChecker();

  return new WriteController(writeFileUseCase, validator, contextChecker);
};
