import { CleanupOldVersions } from "../../../domain/usecases/file-versioning.js";
import { badRequest, ok, serverError } from "../../helpers/index.js";
import { Controller, Request, Response } from "../../protocols/index.js";

export interface CleanupOldVersionsRequest {
  projectName: string;
  maxVersionsPerFile?: number;
}

export class CleanupOldVersionsController implements Controller<CleanupOldVersionsRequest, any> {
  constructor(private readonly cleanupOldVersions: CleanupOldVersions) {}

  async handle(request: Request<CleanupOldVersionsRequest>): Promise<Response<any>> {
    try {
      const { projectName, maxVersionsPerFile } = request.body || {};

      if (!projectName) {
        return badRequest(new Error("projectName is required"));
      }

      const deletedCount = await this.cleanupOldVersions.execute(projectName, maxVersionsPerFile);

      return ok({
        message: `Successfully cleaned up old versions in project '${projectName}'`,
        deletedVersions: deletedCount,
        maxVersionsPerFile: maxVersionsPerFile || 10,
        projectName,
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
