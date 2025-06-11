import { describe, expect, it, vi } from "vitest";
import { CompareFileVersionsController, CompareFileVersionsRequest } from "../../../../src/presentation/controllers/compare-file-versions/compare-file-versions-controller.js";
import { CompareFileVersions } from "../../../../src/domain/usecases/file-versioning.js";

const makeCompareFileVersionsStub = (): CompareFileVersions => {
  class CompareFileVersionsStub implements CompareFileVersions {
    async execute(projectName: string, fileName: string, version1: number, version2: number): Promise<{
      version1Content: string;
      version2Content: string;
      differences: Array<{
        type: 'addition' | 'deletion' | 'modification';
        line: number;
        content: string;
      }>;
    } | null> {
      return {
        version1Content: "Original content line 1\nOriginal content line 2",
        version2Content: "Modified content line 1\nOriginal content line 2\nNew line 3",
        differences: [
          {
            type: 'modification',
            line: 1,
            content: "Modified content line 1"
          },
          {
            type: 'addition',
            line: 3,
            content: "New line 3"
          }
        ]
      };
    }
  }
  return new CompareFileVersionsStub();
};

const makeSut = () => {
  const compareFileVersionsStub = makeCompareFileVersionsStub();
  const sut = new CompareFileVersionsController(compareFileVersionsStub);
  return {
    sut,
    compareFileVersionsStub,
  };
};

describe("CompareFileVersionsController", () => {
  it("should return badRequest if projectName is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        fileName: "any_file",
        version1: 1,
        version2: 2,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("projectName is required");
  });

  it("should return badRequest if fileName is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        projectName: "any_project",
        version1: 1,
        version2: 2,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("fileName is required");
  });

  it("should return badRequest if version1 is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version2: 2,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("version1 is required");
  });

  it("should return badRequest if version2 is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version1: 1,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("version2 is required");
  });

  it("should return badRequest if comparison result is null", async () => {
    const { sut, compareFileVersionsStub } = makeSut();
    vi.spyOn(compareFileVersionsStub, "execute").mockResolvedValueOnce(null);
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version1: 1,
        version2: 2,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Could not compare file versions");
  });

  it("should call CompareFileVersions with correct values", async () => {
    const { sut, compareFileVersionsStub } = makeSut();
    const executeSpy = vi.spyOn(compareFileVersionsStub, "execute");
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version1: 1,
        version2: 2,
      },
    };

    await sut.handle(request as any);

    expect(executeSpy).toHaveBeenCalledWith("any_project", "any_file", 1, 2);
  });

  it("should return ok with comparison data on success", async () => {
    const { sut } = makeSut();
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version1: 1,
        version2: 2,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Successfully compared versions 1 and 2 of file 'any_file' in project 'any_project'");
    expect(response.body.comparison).toEqual({
      version1Content: "Original content line 1\nOriginal content line 2",
      version2Content: "Modified content line 1\nOriginal content line 2\nNew line 3",
      differences: [
        {
          type: 'modification',
          line: 1,
          content: "Modified content line 1"
        },
        {
          type: 'addition',
          line: 3,
          content: "New line 3"
        }
      ]
    });
    expect(response.body.metadata).toEqual({
      projectName: "any_project",
      fileName: "any_file",
      version1: 1,
      version2: 2,
      differencesCount: 2,
    });
  });

  it("should return serverError if CompareFileVersions throws", async () => {
    const { sut, compareFileVersionsStub } = makeSut();
    vi.spyOn(compareFileVersionsStub, "execute").mockRejectedValueOnce(new Error("Database error"));
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version1: 1,
        version2: 2,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(500);
  });
});
