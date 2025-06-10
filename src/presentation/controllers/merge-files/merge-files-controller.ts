import { badRequest, ok, serverError } from "../../helpers/index.js";
import { MissingParamError } from "../../errors/missing-param-error.js";
import {
  Controller,
  MergeFilesUseCase,
  MergeFilesRequest,
  MergeFilesResponse,
  Request,
  Response,
  Validator,
} from "./protocols.js";

export class MergeFilesController implements Controller<MergeFilesRequest, MergeFilesResponse> {
  constructor(
    private readonly validator: Validator,
    private readonly mergeFiles: MergeFilesUseCase
  ) {}

  async handle(request: Request<MergeFilesRequest>): Promise<Response<MergeFilesResponse>> {
    try {
      const error = this.validator.validate(request.body);
      if (error) {
        return badRequest(error);
      }

      const { projectName, format } = request.body!;

      if (!projectName) {
        return badRequest(new MissingParamError("projectName"));
      }      const result = await this.mergeFiles.mergeFiles({
        projectName,
        format: format || 'markdown'
      });

      return ok(result);
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
