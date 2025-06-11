import { ListProjectsUseCase } from "../../domain/usecases/list-projects.js";
import { ListProjectFilesUseCase } from "../../domain/usecases/list-project-files.js";
import { ReadFileUseCase } from "../../domain/usecases/read-file.js";

export interface ProjectContext {
  currentProject?: string;
  availableProjects: string[];
  projectFiles: string[];
  suggestedFileName?: string;
  existingContent?: string;
  projectExists: boolean;
  fileExists: boolean;
}

export class ContextChecker {
  constructor(
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly listProjectFilesUseCase: ListProjectFilesUseCase,
    private readonly readFileUseCase: ReadFileUseCase
  ) {}

  async checkProjectContext(
    requestedProject?: string,
    requestedFile?: string
  ): Promise<ProjectContext> {
    // First, get all available projects
    const projectsResult = await this.listProjectsUseCase.listProjects();
    const availableProjects = this.extractProjectNames(projectsResult);

    let currentProject = requestedProject;
    let projectFiles: string[] = [];
    let existingContent: string | undefined;
    let projectExists = false;
    let fileExists = false;

    // If no project specified, return basic context
    if (!currentProject) {
      return {
        availableProjects,
        projectFiles: [],
        suggestedFileName: this.generateSuggestedFileName(),
        projectExists: false,
        fileExists: false,
      };
    }

    // Check if requested project exists
    projectExists = availableProjects.includes(currentProject);

    if (projectExists) {
      // Get files in the current project
      const filesResult = await this.listProjectFilesUseCase.listProjectFiles({
        projectName: currentProject,
      });
      projectFiles = this.extractFileNames(filesResult);

      // If file is specified, check if it exists and get content
      if (requestedFile) {
        fileExists = projectFiles.includes(requestedFile);
        if (fileExists) {
          try {
            const contentResult = await this.readFileUseCase.readFile({
              projectName: currentProject,
              fileName: requestedFile,
            });

            if (contentResult) {
              existingContent = contentResult.content;
            }
          } catch (error) {
            // File might not be readable, but that's ok
            existingContent = undefined;
          }
        }
      }
    }

    return {
      currentProject,
      availableProjects,
      projectFiles,
      suggestedFileName: requestedFile || this.generateSuggestedFileName(),
      existingContent,
      projectExists,
      fileExists,
    };
  }

  private extractProjectNames(projects: Array<{ name: string }>): string[] {
    return projects.map((project) => project.name);
  }
  private extractFileNames(files: Array<{ name: string }>): string[] {
    return files.map((file) => file.name);
  }

  private generateSuggestedFileName(): string {
    const date = new Date();
    const timestamp = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = date.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
    return `memory_${timestamp}_${time}.md`;
  }

  formatContextInfo(context: ProjectContext): string {
    let info = "📋 **Context Check Results:**\n\n";

    if (!context.currentProject) {
      info += "❌ **No project specified.** Available projects:\n";
      if (context.availableProjects.length === 0) {
        info += "   *No projects found. A new project will be created.*\n";
      } else {
        context.availableProjects.forEach((project, index) => {
          info += `   ${index + 1}. **${project}**\n`;
        });
      }
      info += "\n💡 Please specify which project to use.\n";
      return info;
    }

    if (!context.projectExists) {
      info += `🆕 **New project "${context.currentProject}" will be created.**\n\n`;
    } else {
      info += `✅ **Project found:** ${context.currentProject}\n\n`;
    }

    if (context.projectFiles.length > 0) {
      info += "📁 **Existing files in this project:**\n";
      context.projectFiles.forEach((file, index) => {
        const isTarget = file === context.suggestedFileName;
        info += `   ${index + 1}. **${file}**${
          isTarget ? " ⚠️ (target file)" : ""
        }\n`;
      });
      info += "\n";
    } else {
      info += "📂 **No existing files in this project.**\n\n";
    }

    if (context.existingContent) {
      const preview =
        context.existingContent.length > 200
          ? context.existingContent.substring(0, 200) + "..."
          : context.existingContent;
      info += `📖 **Existing content preview:**\n\`\`\`\n${preview}\n\`\`\`\n\n`;
    }

    info += `💡 **Target filename:** ${context.suggestedFileName}\n`;

    return info;
  }
  generateRecommendation(
    context: ProjectContext,
    operation: "write" | "update" | "read"
  ): string {
    let recommendation = "\n🎯 **Recommendation:**\n";

    if (operation === "write") {
      if (!context.currentProject) {
        recommendation += "- Specify a project name to continue\n";
        if (context.availableProjects.length > 0) {
          recommendation += `- Consider using existing project: ${context.availableProjects[0]}\n`;
        }
      } else if (context.fileExists && context.existingContent) {
        recommendation += "- File already exists with content\n";
        recommendation +=
          "- Consider using **memory_bank_update** instead of write\n";
        recommendation +=
          "- Or use a different filename to avoid overwriting\n";
      } else {
        recommendation += "- Ready to create new file\n";
        recommendation += "- All checks passed ✅\n";
      }
    } else if (operation === "update") {
      if (!context.currentProject) {
        recommendation += "- Specify a project name to continue\n";
      } else if (!context.projectExists) {
        recommendation +=
          "- Project doesn't exist, use **memory_bank_write** to create it\n";
      } else if (!context.fileExists) {
        recommendation += "- File doesn't exist in this project\n";
        recommendation += "- Use **memory_bank_write** to create it first\n";
      } else {
        recommendation += "- Ready to update existing file\n";
        recommendation += "- All checks passed ✅\n";
      }
    } else if (operation === "read") {
      if (!context.currentProject) {
        recommendation += "- Specify a project name to continue\n";
      } else if (!context.projectExists) {
        recommendation += "- Project doesn't exist\n";
        recommendation +=
          "- Use **memory_bank_list_projects** to see available projects\n";
      } else if (!context.fileExists) {
        recommendation += "- File doesn't exist in this project\n";
        recommendation +=
          "- Use **memory_bank_list_project_files** to see available files\n";
        recommendation += "- Or use **memory_bank_write** to create it\n";
      } else {
        recommendation += "- File found and ready to read\n";
        recommendation += "- All checks passed ✅\n";
      }
    }

    return recommendation;
  }
}
