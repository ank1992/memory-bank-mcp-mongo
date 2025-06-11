import { makeCompareFileVersions } from "../use-cases/make-compare-file-versions.js";
import { CompareFileVersionsController } from "../../../presentation/controllers/compare-file-versions/compare-file-versions-controller.js";
import { Controller } from "../../../presentation/protocols/index.js";

export const makeCompareFileVersionsController = (): Controller<any, any> => {
  return new CompareFileVersionsController(makeCompareFileVersions());
};
