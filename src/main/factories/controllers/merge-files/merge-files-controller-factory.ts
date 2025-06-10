import { MergeFilesController } from "../../../../presentation/controllers/merge-files/index.js";
import { ValidatorComposite } from "../../../../validators/validator-composite.js";
import { RequiredFieldValidator } from "../../../../validators/required-field-validator.js";
import { makeMergeFiles } from "../../use-cases/merge-files-factory.js";

export const makeMergeFilesController = (): MergeFilesController => {
  const validators = [
    new RequiredFieldValidator("projectName"),
  ];
  const validator = new ValidatorComposite(validators);
  const mergeFilesUseCase = makeMergeFiles();
  
  return new MergeFilesController(validator, mergeFilesUseCase);
};
