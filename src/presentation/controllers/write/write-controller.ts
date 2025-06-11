import {
  badRequest,
  ok,
  serverError,
  ContextChecker,
} from "../../helpers/index.js";
import {
  Controller,
  Request,
  Response,
  Validator,
  WriteFileUseCase,
  WriteRequest,
  WriteResponse,
} from "./protocols.js";

export class WriteController
  implements Controller<WriteRequest, WriteResponse>
{
  constructor(
    private readonly writeFileUseCase: WriteFileUseCase,
    private readonly validator: Validator,
    private readonly contextChecker: ContextChecker
  ) {}
  async handle(
    request: Request<WriteRequest>
  ): Promise<Response<WriteResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { projectName, fileName, content } = request.body!;

      // Check context before writing
      const context = await this.contextChecker.checkProjectContext(
        projectName,
        fileName
      );
      const contextInfo = this.contextChecker.formatContextInfo(context);

      // If no project specified, return context info and ask for clarification
      if (!context.currentProject) {
        return ok({
          message: `${contextInfo}\n❓ **Action needed:** Please specify which project to use for writing this memory.`,
          contextCheck: true,
          availableProjects: context.availableProjects,
        });
      }

      // If file exists, warn about overwriting
      if (context.fileExists && context.existingContent) {
        const recommendation = this.contextChecker.generateRecommendation(
          context,
          "write"
        );
        return ok({
          message: `${contextInfo}${recommendation}\n⚠️ **Warning:** File "${fileName}" already exists with content. Consider using memory_bank_update instead.\n\n❓ **Do you want to:**\n- Use memory_bank_update to modify existing content\n- Continue with memory_bank_write to completely replace it`,
          contextCheck: true,
          fileExists: true,
          existingContent: context.existingContent,
        });
      }

      // Context is good, proceed with writing
      await this.writeFileUseCase.writeFile({
        projectName,
        fileName,
        content,
      });

      const recommendation = this.contextChecker.generateRecommendation(
        context,
        "write"
      );
      return ok({
        message: `${contextInfo}${recommendation}\n✅ **Memory written successfully!**\n\nFile: **${fileName}**\nProject: **${projectName}**\nContent length: ${content.length} characters`,
        success: true,
        fileName,
        projectName,
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
