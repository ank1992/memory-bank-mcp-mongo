import { CompareFileVersions } from "../../../domain/usecases/file-versioning.js";
import { badRequest, ok, serverError } from "../../helpers/index.js";
import { Controller, Request, Response } from "../../protocols/index.js";

export interface CompareFileVersionsRequest {
  projectName: string;
  fileName: string;
  version1: number;
  version2: number;
}

export class CompareFileVersionsController implements Controller<CompareFileVersionsRequest, any> {
  constructor(private readonly compareFileVersions: CompareFileVersions) {}

  async handle(request: Request<CompareFileVersionsRequest>): Promise<Response<any>> {
    try {
      const { projectName, fileName, version1, version2 } = request.body || {};

      if (!projectName) {
        return badRequest(new Error("projectName is required"));
      }
      if (!fileName) {
        return badRequest(new Error("fileName is required"));
      }
      if (version1 === undefined || version1 === null) {
        return badRequest(new Error("version1 is required"));
      }
      if (version2 === undefined || version2 === null) {
        return badRequest(new Error("version2 is required"));
      }

      const result = await this.compareFileVersions.execute(
        projectName,
        fileName,
        version1,
        version2
      );

      if (!result) {
        return badRequest(new Error("Could not compare file versions"));
      }

      return ok({
        message: `Successfully compared versions ${version1} and ${version2} of file '${fileName}' in project '${projectName}'`,
        comparison: result,
        metadata: {
          projectName,
          fileName,
          version1,
          version2,
          differencesCount: result.differences.length,
        },
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
