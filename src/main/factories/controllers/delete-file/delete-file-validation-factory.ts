import { Validator } from "../../../../presentation/protocols/validator.js";
import { ValidatorComposite } from "../../../../validators/validator-composite.js";
import { RequiredFieldValidator } from "../../../../validators/required-field-validator.js";

const makeValidations = (): Validator[] => {
  return [
    new RequiredFieldValidator("projectName"),
    new RequiredFieldValidator("filePath"),
  ];
};

export const makeDeleteFileValidation = (): Validator => {
  const validations = makeValidations();
  return new ValidatorComposite(validations);
};
