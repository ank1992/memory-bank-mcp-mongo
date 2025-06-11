import { badRequest, notFound, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  Request,
  RequestValidator,
  Response,
  UpdateFileUseCase,
  UpdateRequest,
  UpdateResponse,
  ContextChecker,
} from "./protocols.js";

export class UpdateController
  implements Controller<UpdateRequest, UpdateResponse>
{
  constructor(
    private readonly updateFileUseCase: UpdateFileUseCase,
    private readonly validator: RequestValidator,
    private readonly contextChecker: ContextChecker
  ) {}

  async handle(
    request: Request<UpdateRequest>
  ): Promise<Response<UpdateResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { projectName, fileName, content } = request.body!; // Check project context before updating
      const contextCheck = await this.contextChecker.checkProjectContext(
        projectName,
        fileName
      );

      // Verify file exists before updating
      if (!contextCheck.fileExists) {
        return notFound(
          `File ${fileName} not found in project ${projectName}. Use the write tool to create new files.`
        );
      }

      const result = await this.updateFileUseCase.updateFile({
        projectName,
        fileName,
        content,
      });

      if (result === null) {
        return notFound(`File ${fileName} not found in project ${projectName}`);
      }

      const contextInfo = this.contextChecker.formatContextInfo(contextCheck);
      const recommendation = this.contextChecker.generateRecommendation(
        contextCheck,
        "update"
      );

      return ok({
        message: `File ${fileName} updated successfully in project ${projectName}`,
        projectName,
        fileName,
        contextCheck,
        contextInfo,
        recommendation,
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
