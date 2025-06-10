import { MergeFilesUseCase, MergeFilesResult } from "../../../domain/usecases/merge-files.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";

export interface MergeFilesRequest {
  /**
   * The name of the project to merge files from.
   */
  projectName: string;

  /**
   * The output format for the merged content.
   * @default "markdown"
   */
  format?: "markdown" | "plain";
}

export type MergeFilesResponse = MergeFilesResult;

export {
  Controller,
  MergeFilesUseCase,
  Request,
  Response,
  Validator,
};
