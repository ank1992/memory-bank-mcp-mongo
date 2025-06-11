import { DeleteProject } from "../../../domain/usecases/delete-project.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";

export interface DeleteProjectRequest {
  name: string;
}

export interface DeleteProjectResponse {
  name: string;
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
  DeleteProject as DeleteProjectUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
};
