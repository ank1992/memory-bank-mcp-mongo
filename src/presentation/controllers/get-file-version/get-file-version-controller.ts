import { GetFileVersion } from "../../../domain/usecases/file-versioning.js";
import { badRequest, notFound, ok, serverError } from "../../helpers/index.js";
import { Controller, Request, Response } from "../../protocols/index.js";

export interface GetFileVersionRequest {
  projectName: string;
  fileName: string;
  version: number;
}

export class GetFileVersionController implements Controller<GetFileVersionRequest, any> {
  constructor(private readonly getFileVersion: GetFileVersion) {}

  async handle(request: Request<GetFileVersionRequest>): Promise<Response<any>> {
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

      const fileVersion = await this.getFileVersion.execute(projectName, fileName, version);

      if (!fileVersion) {
        return notFound(`Version ${version} not found for file ${fileName} in project ${projectName}`);
      }

      return ok({
        message: `Retrieved version ${version} of file ${fileName}`,
        data: {
          projectName: fileVersion.projectName,
          fileName: fileVersion.fileName,
          version: fileVersion.version,
          content: fileVersion.content,
          size: fileVersion.size,
          checksum: fileVersion.checksum,
          createdAt: fileVersion.createdAt,
          metadata: {
            encoding: fileVersion.metadata?.encoding,
            mimeType: fileVersion.metadata?.mimeType,
            wordCount: fileVersion.metadata?.wordCount,
            lineCount: fileVersion.metadata?.lineCount,
            keywords: fileVersion.metadata?.keywords,
            summary: fileVersion.metadata?.summary,
            changeDescription: fileVersion.metadata?.changeDescription,
            isAutoSave: fileVersion.metadata?.isAutoSave,
          }
        },
        workflow: {
          next_steps: [
            "Use 'memory_bank_revert_file_to_version' to restore this version as current",
            "Use 'memory_bank_compare_versions' to compare with other versions",
            "Use 'memory_bank_get_file_versions' to see all available versions"
          ]
        }
      });
    } catch (error) {
      console.error('GetFileVersionController error:', error);
      return serverError(error as Error);
    }
  }
}
