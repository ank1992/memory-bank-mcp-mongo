import { ProjectTemplate, CreateFromTemplateInput } from "../entities/project-template.js";
import { Project } from "../entities/project.js";

export interface CreateProjectTemplate {
  execute(template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTemplate>;
}

export interface GetProjectTemplates {
  execute(category?: string, tags?: string[]): Promise<ProjectTemplate[]>;
}

export interface GetProjectTemplate {
  execute(templateId: string): Promise<ProjectTemplate | null>;
}

export interface UpdateProjectTemplate {
  execute(templateId: string, updates: Partial<Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProjectTemplate | null>;
}

export interface DeleteProjectTemplate {
  execute(templateId: string): Promise<boolean>;
}

export interface CreateProjectFromTemplate {
  execute(input: CreateFromTemplateInput): Promise<{
    project: Project;
    filesCreated: Array<{
      fileName: string;
      success: boolean;
      error?: string;
    }>;
  }>;
}

export interface InstallPredefinedTemplates {
  execute(): Promise<{
    installed: ProjectTemplate[];
    errors: Array<{
      templateName: string;
      error: string;
    }>;
  }>;
}
