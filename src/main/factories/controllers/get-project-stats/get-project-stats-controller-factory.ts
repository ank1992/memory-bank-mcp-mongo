import { GetProjectStatsController } from "../../../../presentation/controllers/get-project-stats/get-project-stats-controller.js";
import { makeGetProjectStats } from "../../use-cases/get-project-stats-factory.js";
import { makeContextChecker } from "../../helpers/context-checker-factory.js";
import { makeGetProjectStatsValidation } from "./get-project-stats-validation-factory.js";

export const makeGetProjectStatsController = () => {
  const validator = makeGetProjectStatsValidation();
  const getProjectStatsUseCase = makeGetProjectStats();
  const contextChecker = makeContextChecker();

  return new GetProjectStatsController(
    getProjectStatsUseCase,
    validator,
    contextChecker
  );
};
