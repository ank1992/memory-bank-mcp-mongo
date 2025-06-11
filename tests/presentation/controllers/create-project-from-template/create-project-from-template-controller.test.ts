import { describe, expect, it, vi } from "vitest";
import { CreateProjectFromTemplateController, CreateProjectFromTemplateRequest } from "../../../../src/presentation/controllers/create-project-from-template/create-project-from-template-controller.js";
import { CreateProjectFromTemplate } from "../../../../src/domain/usecases/project-templates.js";
import { Project } from "../../../../src/domain/entities/project.js";

const makeCreateProjectFromTemplateStub = (): CreateProjectFromTemplate => {
  class CreateProjectFromTemplateStub implements CreateProjectFromTemplate {
    async execute(input: { templateId: string; projectName: string; variables: Record<string, any> }): Promise<{
      project: Project;
      filesCreated: Array<{ fileName: string; success: boolean; error?: string }>;
    }> {
      return {
        project: {
          id: "new_project_id",
          name: input.projectName,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
          fileCount: 2,
          totalSize: 200,
          description: "Created from template",
        },
        filesCreated: [
          { fileName: "README.md", success: true },
          { fileName: "notes.md", success: true }
        ]
      };
    }
  }
  return new CreateProjectFromTemplateStub();
};

const makeSut = () => {
  const createProjectFromTemplateStub = makeCreateProjectFromTemplateStub();
  const sut = new CreateProjectFromTemplateController(createProjectFromTemplateStub);
  return {
    sut,
    createProjectFromTemplateStub,
  };
};

describe("CreateProjectFromTemplateController", () => {
  it("should return badRequest if templateId is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        projectName: "Test Project",
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("templateId is required");
  });

  it("should return badRequest if projectName is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        templateId: "simple-note-project",
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("projectName is required");
  });

  it("should call CreateProjectFromTemplate with correct values when no variables provided", async () => {
    const { sut, createProjectFromTemplateStub } = makeSut();
    const executeSpy = vi.spyOn(createProjectFromTemplateStub, "execute");
    
    const request = {
      body: {
        templateId: "simple-note-project",
        projectName: "Test Project",
      },
    };

    await sut.handle(request as any);

    expect(executeSpy).toHaveBeenCalledWith({
      templateId: "simple-note-project",
      projectName: "Test Project", 
      variables: {}
    });
  });

  it("should call CreateProjectFromTemplate with correct values including variables", async () => {
    const { sut, createProjectFromTemplateStub } = makeSut();
    const executeSpy = vi.spyOn(createProjectFromTemplateStub, "execute");
    
    const request = {
      body: {
        templateId: "simple-note-project",
        projectName: "Test Project",
        variables: {
          DESCRIPTION: "A test project description",
          AUTHOR: "Test Author"
        },
      },
    };

    await sut.handle(request as any);    expect(executeSpy).toHaveBeenCalledWith({
      templateId: "simple-note-project",
      projectName: "Test Project",
      variables: {
        DESCRIPTION: "A test project description",
        AUTHOR: "Test Author"
      }
    });
  });

  it("should return ok with project creation data on success", async () => {
    const { sut } = makeSut();
    
    const request = {
      body: {
        templateId: "simple-note-project",
        projectName: "Test Project",
        variables: {
          DESCRIPTION: "A test project"
        },
      },
    };

    const response = await sut.handle(request as any);    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Project "Test Project" created from template with 2 files');
    expect(response.body.data.project).toEqual({
      name: "Test Project",
      description: "Created from template",
      createdAt: new Date("2025-01-01")
    });
    expect(response.body.data.filesCreated.successful).toEqual([
      { fileName: "README.md", success: true },
      { fileName: "notes.md", success: true }
    ]);
    expect(response.body.data.filesCreated.summary).toEqual({
      total: 2,
      successful: 2,
      failed: 0
    });
    expect(response.body.data.templateInfo).toEqual({
      templateId: "simple-note-project",
      variablesUsed: { DESCRIPTION: "A test project" }
    });
    expect(response.body.workflow.next_steps).toContain("Use 'memory_bank_list_project_files' to see all created files");
  });

  it("should handle partial success with some file creation failures", async () => {
    const { sut, createProjectFromTemplateStub } = makeSut();
    vi.spyOn(createProjectFromTemplateStub, "execute").mockResolvedValueOnce({
      project: {
        id: "new_project_id",
        name: "Test Project",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
        fileCount: 1,
        totalSize: 100,
        description: "Created from template",
      },
      filesCreated: [
        { fileName: "README.md", success: true },
        { fileName: "notes.md", success: false, error: "Permission denied" }
      ]
    });
    
    const request = {
      body: {
        templateId: "simple-note-project",
        projectName: "Test Project",
      },
    };

    const response = await sut.handle(request as any);    expect(response.statusCode).toBe(200);
    expect(response.body.data.filesCreated.summary.successful).toBe(1);
    expect(response.body.data.filesCreated.summary.failed).toBe(1);
    expect(response.body.data.filesCreated.successful).toEqual([
      { fileName: "README.md", success: true }
    ]);
    expect(response.body.data.filesCreated.failed).toEqual([
      { fileName: "notes.md", error: "Permission denied" }
    ]);
  });

  it("should return serverError if CreateProjectFromTemplate throws", async () => {
    const { sut, createProjectFromTemplateStub } = makeSut();
    vi.spyOn(createProjectFromTemplateStub, "execute").mockRejectedValueOnce(new Error("Template not found"));
    
    const request = {
      body: {
        templateId: "nonexistent-template",
        projectName: "Test Project",
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(500);
  });
});
