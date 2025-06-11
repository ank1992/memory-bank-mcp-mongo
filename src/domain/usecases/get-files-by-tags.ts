import { File } from "../entities/index.js";

export interface GetFilesByTagsParams {
  projectName: string;
  tags: string[];
}

export interface GetFilesByTagsUseCase {
  getFilesByTags(params: GetFilesByTagsParams): Promise<File[]>;
}
