import { ContextChecker } from "../../../presentation/helpers/index.js";
import { makeListProjects } from "../use-cases/list-projects-factory.js";
import { makeListProjectFiles } from "../use-cases/list-project-files-factory.js";
import { makeReadFile } from "../use-cases/read-file-factory.js";

export const makeContextChecker = (): ContextChecker => {
  const listProjectsUseCase = makeListProjects();
  const listProjectFilesUseCase = makeListProjectFiles();
  const readFileUseCase = makeReadFile();

  return new ContextChecker(
    listProjectsUseCase,
    listProjectFilesUseCase,
    readFileUseCase
  );
};
