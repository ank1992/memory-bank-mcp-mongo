import { badRequest, notFound, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  ReadFileUseCase,
  ReadRequest,
  ReadResponse,
  Request,
  Response,
  Validator,
  ContextChecker,
} from "./protocols.js";

export class ReadController implements Controller<ReadRequest, ReadResponse> {
  constructor(
    private readonly readFileUseCase: ReadFileUseCase,
    private readonly validator: Validator,
    private readonly contextChecker: ContextChecker
  ) {}

  async handle(request: Request<ReadRequest>): Promise<Response<ReadResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { projectName, fileName } = request.body!;

      // Check project context to provide helpful information
      const contextCheck = await this.contextChecker.checkProjectContext(
        projectName,
        fileName
      );

      const content = await this.readFileUseCase.readFile({
        projectName,
        fileName,
      });
      if (content === null) {
        const contextInfo = this.contextChecker.formatContextInfo(contextCheck);
        const recommendation = this.contextChecker.generateRecommendation(
          contextCheck,
          "read"
        );

        return notFound(
          `File ${fileName} not found in project ${projectName}${contextInfo}${recommendation}`
        );
      }

      const contextInfo = this.contextChecker.formatContextInfo(contextCheck);
      const recommendation = this.contextChecker.generateRecommendation(
        contextCheck,
        "read"
      );

      return ok({
        content,
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
