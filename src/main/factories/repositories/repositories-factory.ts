import { loadConfig } from "../../config/config.js";
import { StorageFactory } from "../../../infra/database/storage-factory.js";
import { FileRepository } from "../../../data/protocols/file-repository.js";
import { ProjectRepository } from "../../../data/protocols/project-repository.js";
import { FileVersionRepository } from "../../../data/protocols/file-version-repository.js";
import { ProjectTemplateRepository } from "../../../data/protocols/project-template-repository.js";

class RepositoriesService {
  private repositories: {
    fileRepository: FileRepository;
    projectRepository: ProjectRepository;
    fileVersionRepository: FileVersionRepository;
    projectTemplateRepository: ProjectTemplateRepository;
  } | null = null;

  async getRepositories() {
    if (!this.repositories) {
      const config = loadConfig();
      this.repositories = await StorageFactory.createRepositories(config);
    }
    return this.repositories;
  }

  // Synchronous getter - assumes repositories are already initialized
  get() {
    if (!this.repositories) {
      throw new Error('Repositories not initialized. Call initialize() first.');
    }
    return this.repositories;
  }

  async initialize() {
    await this.getRepositories();
  }
}

export const repositoriesService = new RepositoriesService();

export const getRepositories = () => repositoriesService.get();
