import { GetFileVersionsController } from "../../../presentation/controllers/get-file-versions/get-file-versions-controller.js";
import { makeGetFileVersions } from "../use-cases/make-get-file-versions.js";

export const makeGetFileVersionsController = () => {
  return new GetFileVersionsController(makeGetFileVersions());
};
