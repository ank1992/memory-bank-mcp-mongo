import { DbGetProjectStats } from "../../../data/usecases/get-project-stats/db-get-project-stats.js";
import { getRepositories } from "../repositories/repositories-factory.js";

export const makeGetProjectStats = () => {
  const { fileRepository } = getRepositories();
  return new DbGetProjectStats(fileRepository);
};
