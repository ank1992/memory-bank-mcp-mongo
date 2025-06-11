import { WriteFileUseCase } from "../../../domain/usecases/write-file.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";

export interface WriteRequest {
  projectName: string;
  fileName: string;
  content: string;
}

export interface WriteResponse {
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

export { Controller, Request, Response, Validator, WriteFileUseCase, ContextChecker };
