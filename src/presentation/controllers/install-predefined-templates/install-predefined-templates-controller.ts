import { InstallPredefinedTemplates } from "../../../domain/usecases/project-templates.js";
import { ok, serverError } from "../../helpers/index.js";
import { Controller, Request, Response } from "../../protocols/index.js";

interface InstallTemplatesRequest {}

interface InstallTemplatesResponse {
  message: string;
  data: {
    installed: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
    }>;
    errors: Array<{
      templateName: string;
      error: string;
    }>;
  };
}

export class InstallPredefinedTemplatesController implements Controller<InstallTemplatesRequest, InstallTemplatesResponse> {
  constructor(
    private readonly installPredefinedTemplates: InstallPredefinedTemplates
  ) {}

  async handle(request: Request<InstallTemplatesRequest>): Promise<Response<InstallTemplatesResponse>> {
    try {
      const result = await this.installPredefinedTemplates.execute();      return ok({
        message: `Installed ${result.installed.length} predefined templates`,
        data: {
          installed: result.installed.map(template => ({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
          })),
          errors: result.errors,
        }
      });
    } catch (error) {
      console.error('InstallPredefinedTemplatesController error:', error);
      return serverError(error as Error);
    }
  }
}
