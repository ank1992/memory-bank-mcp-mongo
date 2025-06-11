import { RevertFileToVersion } from "../../../domain/usecases/file-versioning.js";
import { badRequest, notFound, ok, serverError } from "../../helpers/index.js";
import { Controller, Request, Response } from "../../protocols/index.js";

export interface RevertFileToVersionRequest {
  projectName: string;
  fileName: string;
  version: number;
}

export class RevertFileToVersionController implements Controller<RevertFileToVersionRequest, any> {
  constructor(private readonly revertFileToVersion: RevertFileToVersion) {}

  async handle(request: Request<RevertFileToVersionRequest>): Promise<Response<any>> {
    try {
      const { projectName, fileName, version } = request.body || {};      if (!projectName) {
        return badRequest(new Error("projectName is required"));
      }
      if (!fileName) {
        return badRequest(new Error("fileName is required"));
      }
      if (version === undefined || version === null) {
        return badRequest(new Error("version is required"));
      }

      if (!Number.isInteger(version) || version < 1) {
        return badRequest(new Error("Version must be a positive integer"));
      }

      const success = await this.revertFileToVersion.execute(projectName, fileName, version);

      if (!success) {
        return notFound(`Cannot revert: Version ${version} not found for file ${fileName} in project ${projectName}`);
      }

      return ok({
        message: `Successfully reverted ${fileName} to version ${version}`,
        data: {
          projectName,
          fileName,
          revertedToVersion: version,
          timestamp: new Date().toISOString()
        },
        workflow: {
          next_steps: [
            "Use 'memory_bank_read_file' to view the reverted content",
            "Use 'memory_bank_get_file_versions' to see the new version history",
            "The revert created a new version with the old content"
          ]
        },
        warnings: [
          "⚠️ Reverting creates a new version with the old content",
          "⚠️ The current version is preserved in version history",
          "⚠️ This action cannot be undone - consider backing up current content first"
        ]
      });
    } catch (error) {
      console.error('RevertFileToVersionController error:', error);
      return serverError(error as Error);
    }
  }
}
