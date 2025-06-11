import { DeleteFile } from "../../../domain/usecases/delete-file.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";

export interface DeleteFileRequest {
  projectName: string;
  filePath: string;
}

export interface DeleteFileResponse {
  projectName: string;
  filePath: string;
  success: boolean;
  contextInfo: string;
  workflowGuidance: string;
  contextCheck: {
    projectExists: boolean;
    availableProjects: string[];
  };
}

export {
  Controller,
  DeleteFile as DeleteFileUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
};
