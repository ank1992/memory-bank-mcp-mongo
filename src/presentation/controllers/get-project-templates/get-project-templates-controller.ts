import { GetProjectTemplates } from "../../../domain/usecases/project-templates.js";
import { ok, serverError } from "../../helpers/index.js";
import { Controller, Request, Response } from "../../protocols/index.js";

export interface GetProjectTemplatesRequest {
  category?: string;
  tags?: string[];
}

export class GetProjectTemplatesController implements Controller<GetProjectTemplatesRequest, any> {
  constructor(private readonly getProjectTemplates: GetProjectTemplates) {}

  async handle(request: Request<GetProjectTemplatesRequest>): Promise<Response<any>> {
    try {
      const { category, tags } = request.body || {};

      const templates = await this.getProjectTemplates.execute(category, tags);

      return ok({
        message: `Found ${templates.length} project templates`,
        data: {
          templates: templates.map(template => ({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            version: template.version,
            author: template.author,
            tags: template.tags,
            variableCount: template.variables.length,
            fileCount: template.files.length,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt
          })),
          totalTemplates: templates.length,
          filters: {
            category: category || "all",
            tags: tags || []
          }
        },
        workflow: {
          next_steps: [
            "Use 'memory_bank_create_project_from_template' to create a project from a template",
            "Use 'memory_bank_install_predefined_templates' to add built-in templates",
            "Use 'memory_bank_create_project_template' to create your own template"
          ]
        }
      });    } catch (error) {
      return serverError(error as Error);
    }
  }
}
