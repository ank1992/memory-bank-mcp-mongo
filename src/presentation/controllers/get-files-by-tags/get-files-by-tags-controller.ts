import { badRequest, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  GetFilesByTagsRequest,
  GetFilesByTagsResponse,
  GetFilesByTagsUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
} from "./protocols.js";

export class GetFilesByTagsController
  implements Controller<GetFilesByTagsRequest, GetFilesByTagsResponse>
{
  constructor(
    private readonly getFilesByTagsUseCase: GetFilesByTagsUseCase,
    private readonly validator: Validator,
    private readonly contextChecker: ContextChecker
  ) {}

  async handle(
    request: Request<GetFilesByTagsRequest>
  ): Promise<Response<GetFilesByTagsResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { projectName, tags } = request.body!;

      // Check project context first
      const contextCheck = await this.contextChecker.checkProjectContext(
        projectName
      );      const files = await this.getFilesByTagsUseCase.getFilesByTags({
        projectName,
        tags,
      });

      const filePaths = files.map((file) => file.name);

      const contextInfo =
        files.length === 0
          ? `🏷️ No files found with tags [${tags.join(", ")}] in project "${projectName}"`
          : `🏷️ Found ${files.length} file${
              files.length !== 1 ? "s" : ""
            } with tags [${tags.join(", ")}] in project "${projectName}"`;

      const workflowGuidance =
        files.length === 0
          ? `\n🎯 **Next Steps:**\n- Use **memory_bank_write** to add files with these tags\n- Check available tags in this project\n- Verify tag spelling and format`
          : `\n🎯 **Next Steps:**\n- Use **memory_bank_read** to examine specific files\n- Use **memory_bank_update** to modify tag assignments\n- Use **memory_bank_merge** to combine related files`;

      return ok({
        projectName,
        tags,
        files: filePaths,
        totalCount: files.length,
        contextInfo,
        workflowGuidance,
        contextCheck,
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
