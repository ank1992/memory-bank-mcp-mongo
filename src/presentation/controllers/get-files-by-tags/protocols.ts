import { GetFilesByTagsUseCase } from "../../../domain/usecases/get-files-by-tags.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";

export interface GetFilesByTagsRequest {
  projectName: string;
  tags: string[];
}

export interface GetFilesByTagsResponse {
  projectName: string;
  tags: string[];
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
  GetFilesByTagsUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
};
