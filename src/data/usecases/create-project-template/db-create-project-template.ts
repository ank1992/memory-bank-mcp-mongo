import { CreateProjectTemplate } from "../../../domain/usecases/project-templates.js";
import { ProjectTemplateRepository } from "../../protocols/project-template-repository.js";
import { ProjectTemplate } from "../../../domain/entities/project-template.js";

export class DbCreateProjectTemplate implements CreateProjectTemplate {
  constructor(
    private readonly projectTemplateRepository: ProjectTemplateRepository
  ) {}

  async execute(template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTemplate> {
    return await this.projectTemplateRepository.create(template);
  }
}
