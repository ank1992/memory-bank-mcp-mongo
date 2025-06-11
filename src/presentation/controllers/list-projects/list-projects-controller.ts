import { ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  ListProjectsResponse,
  ListProjectsUseCase,
  Response,
} from "./protocols.js";

export class ListProjectsController
  implements Controller<void, ListProjectsResponse>
{
  constructor(private readonly listProjectsUseCase: ListProjectsUseCase) {}
  async handle(): Promise<Response<ListProjectsResponse>> {
    try {
      const projectEntities = await this.listProjectsUseCase.listProjects();
      const projects = projectEntities.map((p) => p.name);

      const contextInfo =
        projects.length === 0
          ? "📁 No projects found in the memory bank"
          : `📁 Found ${projects.length} project${
              projects.length !== 1 ? "s" : ""
            } in the memory bank`;

      const workflowGuidance =
        projects.length === 0
          ? "\n🎯 **Next Steps:**\n- Use **memory_bank_write** to create your first project and file\n- Example: memory_bank_write(projectName='my-project', fileName='notes.md', content='...')"
          : "\n🎯 **Next Steps:**\n- Use **list_project_files** to see files in a specific project\n- Use **memory_bank_read** to view file contents\n- Use **memory_bank_write** to add new files to existing projects";

      return ok({
        projects,
        totalCount: projects.length,
        contextInfo,
        workflowGuidance,
      });
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
