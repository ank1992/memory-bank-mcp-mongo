import { GetFileVersions } from "../../../domain/usecases/file-versioning.js";
import { badRequest, ok, serverError } from "../../helpers/index.js";
import { Controller, Request, Response } from "../../protocols/index.js";

export interface GetFileVersionsRequest {
  projectName: string;
  fileName: string;
}

export class GetFileVersionsController implements Controller<GetFileVersionsRequest, any> {
  constructor(private readonly getFileVersions: GetFileVersions) {}

  async handle(request: Request<GetFileVersionsRequest>): Promise<Response<any>> {
    try {
      const { projectName, fileName } = request.body || {};

      if (!projectName) {
        return badRequest(new Error("projectName is required"));
      }
      if (!fileName) {
        return badRequest(new Error("fileName is required"));
      }

      const versions = await this.getFileVersions.execute(projectName, fileName);

      return ok({
        message: `Found ${versions.length} versions for file ${fileName}`,
        data: {
          projectName,
          fileName,
          versions: versions.map(version => ({
            version: version.version,
            size: version.size,
            checksum: version.checksum,
            createdAt: version.createdAt,
            metadata: {
              wordCount: version.metadata?.wordCount,
              lineCount: version.metadata?.lineCount,
              changeDescription: version.metadata?.changeDescription,
              isAutoSave: version.metadata?.isAutoSave,
            }
          })),
          totalVersions: versions.length
        },
        workflow: {          next_steps: [
            "Use 'memory_bank_read_version' to view a specific version's content",
            "Use 'memory_bank_compare_versions' to compare two versions",
            "Use 'memory_bank_revert_file_to_version' to restore an older version"
          ]
        }
      });
    } catch (error) {
      console.error('GetFileVersionsController error:', error);
      return serverError(error as Error);
    }
  }
}
