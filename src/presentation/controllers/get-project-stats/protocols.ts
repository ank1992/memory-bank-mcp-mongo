import { GetProjectStats } from "../../../domain/usecases/get-project-stats.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";

export interface GetProjectStatsRequest {
  projectName: string;
}

export interface GetProjectStatsResponse {
  projectName: string;
  fileCount: number;
  totalSize: number;
  contextInfo: string;
  workflowGuidance: string;
  contextCheck: {
    projectExists: boolean;
    availableProjects: string[];
  };
}

export {
  Controller,
  GetProjectStats as GetProjectStatsUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
};
