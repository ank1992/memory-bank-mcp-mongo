import { SearchProjectFilesUseCase } from "../../../domain/usecases/search-project-files.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";

export interface SearchProjectFilesRequest {
  projectName: string;
  query: string;
}

export interface SearchProjectFilesResponse {
  projectName: string;
  query: string;
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
  SearchProjectFilesUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
};
