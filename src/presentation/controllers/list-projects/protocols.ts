import { ListProjectsUseCase } from "../../../domain/usecases/list-projects.js";
import { Controller, Response } from "../../protocols/index.js";

export interface ListProjectsResponse {
  projects: string[];
  totalCount: number;
  contextInfo: string;
  workflowGuidance: string;
}

export { Controller, ListProjectsUseCase, Response };
