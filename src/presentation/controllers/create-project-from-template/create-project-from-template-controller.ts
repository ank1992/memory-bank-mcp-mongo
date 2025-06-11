import { CreateProjectFromTemplate } from "../../../domain/usecases/project-templates.js";
import { badRequest, ok, serverError } from "../../helpers/index.js";
import { Controller, Request, Response } from "../../protocols/index.js";

export interface CreateProjectFromTemplateRequest {
  templateId: string;
  projectName: string;
  variables?: Record<string, any>;
}

export class CreateProjectFromTemplateController implements Controller<CreateProjectFromTemplateRequest, any> {
  constructor(private readonly createProjectFromTemplate: CreateProjectFromTemplate) {}

  async handle(request: Request<CreateProjectFromTemplateRequest>): Promise<Response<any>> {
    try {
      const { templateId, projectName, variables = {} } = request.body || {};

      if (!templateId) {
        return badRequest(new Error("templateId is required"));
      }
      if (!projectName) {
        return badRequest(new Error("projectName is required"));
      }

      const result = await this.createProjectFromTemplate.execute({
        templateId,
        projectName,
        variables
      });

      const successfulFiles = result.filesCreated.filter(f => f.success);
      const failedFiles = result.filesCreated.filter(f => !f.success);

      return ok({
        message: `Project "${projectName}" created from template with ${successfulFiles.length} files`,
        data: {
          project: {
            name: result.project.name,
            description: result.project.description,
            createdAt: result.project.createdAt
          },
          filesCreated: {
            successful: successfulFiles.map(f => ({
              fileName: f.fileName,
              success: f.success
            })),
            failed: failedFiles.map(f => ({
              fileName: f.fileName,
              error: f.error
            })),
            summary: {
              total: result.filesCreated.length,
              successful: successfulFiles.length,
              failed: failedFiles.length
            }
          },
          templateInfo: {
            templateId,
            variablesUsed: variables
          }
        },
        workflow: {
          next_steps: [
            "Use 'memory_bank_list_project_files' to see all created files",
            "Use 'memory_bank_read_file' to view individual file contents",
            "Start working with your new project files"
          ]
        },
        ...(failedFiles.length > 0 && {
          warnings: [
            `⚠️ ${failedFiles.length} files failed to create`,
            "Check the failed files list for specific error details"
          ]
        })
      });
    } catch (error) {
      console.error('CreateProjectFromTemplateController error:', error);
      return serverError(error as Error);
    }
  }
}
