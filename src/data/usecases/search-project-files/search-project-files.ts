import {
  FileRepository,
  SearchProjectFilesParams,
  SearchProjectFilesUseCase,
  ProjectRepository,
} from "./search-project-files-protocols.js";

export class SearchProjectFiles implements SearchProjectFilesUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  async searchProjectFiles(params: SearchProjectFilesParams): Promise<import("../../../domain/entities/index.js").File[]> {
    const { projectName, query } = params;
    const projectExists = await this.projectRepository.projectExists(
      projectName
    );

    if (!projectExists) {
      return [];
    }

    return this.fileRepository.searchFiles(projectName, query);
  }
}
