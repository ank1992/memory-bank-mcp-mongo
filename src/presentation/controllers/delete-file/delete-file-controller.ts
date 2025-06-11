import { badRequest, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  DeleteFileRequest,
  DeleteFileResponse,
  DeleteFileUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
} from "./protocols.js";

export class DeleteFileController
  implements Controller<DeleteFileRequest, DeleteFileResponse>
{
  constructor(
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly validator: Validator,
    private readonly contextChecker: ContextChecker
  ) {}

  async handle(
    request: Request<DeleteFileRequest>
  ): Promise<Response<DeleteFileResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { projectName, filePath } = request.body!;

      // Check project context first
      const contextCheck = await this.contextChecker.checkProjectContext(
        projectName
      );

      const success = await this.deleteFileUseCase.execute({
        projectName,
        filePath,
      });

      const contextInfo = success
        ? `🗑️ Successfully deleted file "${filePath}" from project "${projectName}"`
        : `❌ Failed to delete file "${filePath}" from project "${projectName}" (file may not exist)`;

      const workflowGuidance = success
        ? "\n🎯 **Next Steps:**\n- Use **memory_bank_list_project_files** to see remaining files\n- Use **memory_bank_write** to add new content if needed\n- Consider backing up important data before deletion"
        : "\n🎯 **Next Steps:**\n- Use **memory_bank_list_project_files** to see available files\n- Verify the file path and project name\n- Check if the file was already deleted";

      return ok({
        projectName,
        filePath,
        success,
        contextInfo,
        workflowGuidance,
        contextCheck,
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
