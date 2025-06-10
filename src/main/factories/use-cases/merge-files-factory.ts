import { MergeFiles } from "../../../data/usecases/merge-files/merge-files.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeMergeFiles = () => {
  const { fileRepository, projectRepository } = getRepositories();
  return new MergeFiles(fileRepository, projectRepository);
};
