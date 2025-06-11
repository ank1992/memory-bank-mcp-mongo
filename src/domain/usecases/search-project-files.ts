import { File } from "../entities/index.js";

export interface SearchProjectFilesParams {
  projectName: string;
  query: string;
}

export interface SearchProjectFilesUseCase {
  searchProjectFiles(params: SearchProjectFilesParams): Promise<File[]>;
}
