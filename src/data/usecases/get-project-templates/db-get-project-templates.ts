import { GetProjectTemplates } from "../../../domain/usecases/project-templates.js";
import { ProjectTemplateRepository } from "../../protocols/project-template-repository.js";
import { ProjectTemplate } from "../../../domain/entities/project-template.js";

export class DbGetProjectTemplates implements GetProjectTemplates {
  constructor(
    private readonly projectTemplateRepository: ProjectTemplateRepository
  ) {}

  async execute(category?: string, tags?: string[]): Promise<ProjectTemplate[]> {
    return await this.projectTemplateRepository.getAll(category, tags);
  }
}
