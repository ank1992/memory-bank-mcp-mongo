import { UpdateFileUseCase } from "../../../domain/usecases/update-file.js";
import { NotFoundError } from "../../errors/index.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";

export interface UpdateRequest {
  projectName: string;
  fileName: string;
  content: string;
}

export interface UpdateResponse {
  message: string;
  projectName: string;
  fileName: string;
  contextCheck: {
    projectExists: boolean;
    fileExists: boolean;
    availableProjects: string[];
    projectFiles: string[];
  };
  contextInfo?: string;
  recommendation?: string;
}

export type RequestValidator = Validator;

export {
  Controller,
  NotFoundError,
  Request,
  Response,
  UpdateFileUseCase,
  ContextChecker,
};
