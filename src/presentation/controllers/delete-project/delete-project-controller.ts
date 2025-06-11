import { badRequest, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  DeleteProjectRequest,
  DeleteProjectResponse,
  DeleteProjectUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
} from "./protocols.js";

export class DeleteProjectController
  implements Controller<DeleteProjectRequest, DeleteProjectResponse>
{
  constructor(
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly validator: Validator,
    private readonly contextChecker: ContextChecker
  ) {}

  async handle(
    request: Request<DeleteProjectRequest>
  ): Promise<Response<DeleteProjectResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { name } = request.body!;

      // Check project context first
      const contextCheck = await this.contextChecker.checkProjectContext(name);

      const success = await this.deleteProjectUseCase.execute({ name });

      const contextInfo = success
        ? `🗑️ Successfully deleted project "${name}" and all its files`
        : `❌ Failed to delete project "${name}" (project may not exist)`;

      const workflowGuidance = success
        ? "\n🎯 **Next Steps:**\n- Use **memory_bank_list_projects** to see remaining projects\n- Use **memory_bank_write** to create a new project\n- ⚠️ **Warning:** This action is permanent and cannot be undone"
        : "\n🎯 **Next Steps:**\n- Use **memory_bank_list_projects** to see available projects\n- Verify the project name spelling\n- Check if the project was already deleted";

      return ok({
        name,
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
