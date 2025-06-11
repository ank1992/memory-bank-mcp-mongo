import { RevertFileToVersionController } from "../../../presentation/controllers/revert-file-to-version/revert-file-to-version-controller.js";
import { makeRevertFileToVersion } from "../use-cases/make-revert-file-to-version.js";

export const makeRevertFileToVersionController = () => {
  return new RevertFileToVersionController(makeRevertFileToVersion());
};
