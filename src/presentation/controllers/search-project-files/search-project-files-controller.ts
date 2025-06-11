import { badRequest, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  SearchProjectFilesRequest,
  SearchProjectFilesResponse,
  SearchProjectFilesUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
} from "./protocols.js";

export class SearchProjectFilesController
  implements Controller<SearchProjectFilesRequest, SearchProjectFilesResponse>
{
  constructor(
    private readonly searchProjectFilesUseCase: SearchProjectFilesUseCase,
    private readonly validator: Validator,
    private readonly contextChecker: ContextChecker
  ) {}

  async handle(
    request: Request<SearchProjectFilesRequest>
  ): Promise<Response<SearchProjectFilesResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { projectName, query } = request.body!;

      // Check project context first
      const contextCheck = await this.contextChecker.checkProjectContext(
        projectName
      );      const files = await this.searchProjectFilesUseCase.searchProjectFiles({
        projectName,
        query,
      });

      const filePaths = files.map((file) => file.name);

      const contextInfo =
        files.length === 0
          ? `🔍 No files found matching "${query}" in project "${projectName}"`
          : `🔍 Found ${files.length} file${
              files.length !== 1 ? "s" : ""
            } matching "${query}" in project "${projectName}"`;

      const workflowGuidance =
        files.length === 0
          ? "\n🎯 **Next Steps:**\n- Try broader search terms\n- Use **memory_bank_list_project_files** to see all available files\n- Check spelling and try different keywords"
          : "\n🎯 **Next Steps:**\n- Use **memory_bank_read** to examine specific files\n- Use **memory_bank_update** to modify found files\n- Use **memory_bank_merge** to combine related files";

      return ok({
        projectName,
        query,
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
