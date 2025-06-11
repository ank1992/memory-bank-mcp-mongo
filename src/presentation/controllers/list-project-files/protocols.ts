import { ListProjectFilesUseCase } from "../../../domain/usecases/list-project-files.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";

export interface ListProjectFilesRequest {
  projectName: string;
}

export interface ListProjectFilesResponse {
  projectName: string;
  files: string[];
  totalCount: number;
  contextInfo: string;
  workflowGuidance: string;
  contextCheck: {
    projectExists: boolean;
    availableProjects: string[];
  };
}

export {
  Controller,
  ListProjectFilesUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
};
