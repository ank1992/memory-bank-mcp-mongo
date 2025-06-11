import { badRequest, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  ListProjectFilesRequest,
  ListProjectFilesResponse,
  ListProjectFilesUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
} from "./protocols.js";

export class ListProjectFilesController
  implements Controller<ListProjectFilesRequest, ListProjectFilesResponse>
{
  constructor(
    private readonly listProjectFilesUseCase: ListProjectFilesUseCase,
    private readonly validator: Validator,
    private readonly contextChecker: ContextChecker
  ) {}

  async handle(
    request: Request<ListProjectFilesRequest>
  ): Promise<Response<ListProjectFilesResponse>> {
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

      const files = await this.listProjectFilesUseCase.listProjectFiles({
        projectName,
      });

      const contextInfo =
        files.length === 0
          ? `📄 No files found in project "${projectName}"`
          : `📄 Found ${files.length} file${
              files.length !== 1 ? "s" : ""
            } in project "${projectName}"`;

      const workflowGuidance =
        files.length === 0
          ? "\n🎯 **Next Steps:**\n- Use **memory_bank_write** to add the first file to this project\n- Example: memory_bank_write(projectName='" +
            projectName +
            "', fileName='notes.md', content='...')"
          : "\n🎯 **Next Steps:**\n- Use **memory_bank_read** to view specific file contents\n- Use **memory_bank_write** to add new files\n- Use **memory_bank_update** to modify existing files";

      return ok({
        projectName,
        files,
        totalCount: files.length,
        contextInfo,
        workflowGuidance,
        contextCheck: {
          projectExists: contextCheck.projectExists,
          availableProjects: contextCheck.availableProjects,
        },
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
