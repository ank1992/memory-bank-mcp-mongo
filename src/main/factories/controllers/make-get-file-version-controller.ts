import { GetFileVersionController } from "../../../presentation/controllers/get-file-version/get-file-version-controller.js";
import { makeGetFileVersion } from "../use-cases/make-get-file-version.js";

export const makeGetFileVersionController = () => {
  return new GetFileVersionController(makeGetFileVersion());
};
