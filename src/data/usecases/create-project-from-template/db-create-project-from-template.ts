import { CreateProjectFromTemplate } from "../../../domain/usecases/project-templates.js";
import { ProjectTemplateRepository } from "../../protocols/project-template-repository.js";
import { FileRepository } from "../../protocols/file-repository.js";
import { ProjectRepository } from "../../protocols/project-repository.js";
import { CreateFromTemplateInput } from "../../../domain/entities/project-template.js";
import { Project } from "../../../domain/entities/project.js";

export class DbCreateProjectFromTemplate implements CreateProjectFromTemplate {
  constructor(
    private readonly projectTemplateRepository: ProjectTemplateRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly fileRepository: FileRepository
  ) {}
  async execute(input: CreateFromTemplateInput): Promise<{
    project: Project;
    filesCreated: Array<{
      fileName: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    // Get the template
    const template = await this.projectTemplateRepository.getById(input.templateId);
    if (!template) {
      throw new Error(`Template with ID ${input.templateId} not found`);
    }

    // Ensure the project exists
    await this.projectRepository.ensureProject(input.projectName);
    
    // Get the created/existing project
    const project = await (this.projectRepository as any).getProject(input.projectName);
    if (!project) {
      throw new Error(`Failed to create or retrieve project ${input.projectName}`);
    }

    const filesCreated: Array<{
      fileName: string;
      success: boolean;
      error?: string;
    }> = [];

    // Create files from template
    for (const templateFile of template.files) {
      try {
        let content = templateFile.content;
        
        // Replace template variables
        content = this.replaceTemplateVariables(content, input.variables, template.variables);

        const fileName = this.replaceTemplateVariables(templateFile.path, input.variables, template.variables);
        
        const createdFile = await this.fileRepository.writeFile(input.projectName, fileName, content);
        
        filesCreated.push({
          fileName,
          success: !!createdFile,
          error: createdFile ? undefined : 'Failed to create file',
        });
      } catch (error) {
        filesCreated.push({
          fileName: templateFile.path,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Get updated project with correct stats
    const updatedProject = await (this.projectRepository as any).getProject(input.projectName);

    return {
      project: updatedProject || project,
      filesCreated,
    };
  }

  private replaceTemplateVariables(
    content: string, 
    providedVariables: Record<string, any>,
    templateVariables: Array<{
      name: string;
      description: string;
      defaultValue?: string;
      required: boolean;
      type: 'string' | 'number' | 'boolean' | 'date';
    }>
  ): string {
    let result = content;
    
    for (const templateVar of templateVariables) {
      const value = providedVariables[templateVar.name] ?? templateVar.defaultValue ?? '';
      const placeholder = `{{${templateVar.name}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    // Replace common template variables
    result = result.replace(/{{DATE}}/g, new Date().toISOString().split('T')[0]);
    result = result.replace(/{{YEAR}}/g, new Date().getFullYear().toString());
    result = result.replace(/{{MONTH}}/g, (new Date().getMonth() + 1).toString().padStart(2, '0'));
    result = result.replace(/{{DAY}}/g, new Date().getDate().toString().padStart(2, '0'));
    
    return result;
  }
}
