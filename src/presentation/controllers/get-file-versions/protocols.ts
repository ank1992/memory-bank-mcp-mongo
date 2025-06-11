import { GetFileVersions } from "../../../domain/usecases/file-versioning.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";
import { ContextChecker } from "../../helpers/index.js";
import { FileVersion } from "../../../domain/entities/file-version.js";

export interface GetFileVersionsRequest {
  projectName: string;
  fileName: string;
}

export interface GetFileVersionsResponse {
  projectName: string;
  fileName: string;
  versions: Array<{
    version: number;
    size: number;
    checksum: string;
    createdAt: Date;
    metadata?: {
      wordCount?: number;
      lineCount?: number;
      changeDescription?: string;
      isAutoSave?: boolean;
    };
  }>;
  totalVersions: number;
  contextInfo: string;
  workflowGuidance: string;
  contextCheck: {
    projectExists: boolean;
    fileExists: boolean;
    availableProjects: string[];
  };
}

export {
  Controller,
  GetFileVersions as GetFileVersionsUseCase,
  Request,
  Response,
  Validator,
  ContextChecker,
};
