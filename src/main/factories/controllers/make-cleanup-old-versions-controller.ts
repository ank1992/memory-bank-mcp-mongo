import { makeCleanupOldVersions } from "../use-cases/make-cleanup-old-versions.js";
import { CleanupOldVersionsController } from "../../../presentation/controllers/cleanup-old-versions/cleanup-old-versions-controller.js";
import { Controller } from "../../../presentation/protocols/index.js";

export const makeCleanupOldVersionsController = (): Controller<any, any> => {
  return new CleanupOldVersionsController(makeCleanupOldVersions());
};
