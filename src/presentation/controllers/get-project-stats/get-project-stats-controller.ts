import { badRequest, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  GetProjectStatsRequest,
  GetProjectStatsResponse,
  GetProjectStatsUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
} from "./protocols.js";

export class GetProjectStatsController
  implements Controller<GetProjectStatsRequest, GetProjectStatsResponse>
{
  constructor(
    private readonly getProjectStatsUseCase: GetProjectStatsUseCase,
    private readonly validator: Validator,
    private readonly contextChecker: ContextChecker
  ) {}

  async handle(
    request: Request<GetProjectStatsRequest>
  ): Promise<Response<GetProjectStatsResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { projectName } = request.body!;

      // Check project context first
      const contextCheck = await this.contextChecker.checkProjectContext(
        projectName
      );

      const stats = await this.getProjectStatsUseCase.execute({
        projectName,
      });

      const contextInfo = `📊 Project "${projectName}" statistics: ${stats.fileCount} files, ${formatBytes(stats.totalSize)} total size`;

      const workflowGuidance =
        stats.fileCount === 0
          ? "\n🎯 **Next Steps:**\n- Use **memory_bank_write** to add the first file to this project\n- Start building your project content"
          : "\n🎯 **Next Steps:**\n- Use **memory_bank_list_project_files** to see all files\n- Use **memory_bank_search** to find specific content\n- Use **memory_bank_merge** to consolidate files if needed";

      return ok({
        projectName,
        fileCount: stats.fileCount,
        totalSize: stats.totalSize,
        contextInfo,
        workflowGuidance,
        contextCheck,
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 bytes";
  const k = 1024;
  const sizes = ["bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
