import { describe, expect, it, vi } from "vitest";
import { GetFileVersionsController, GetFileVersionsRequest } from "../../../../src/presentation/controllers/get-file-versions/get-file-versions-controller.js";
import { GetFileVersions } from "../../../../src/domain/usecases/file-versioning.js";
import { FileVersion } from "../../../../src/domain/entities/file-version.js";

const makeGetFileVersionsStub = (): GetFileVersions => {
  class GetFileVersionsStub implements GetFileVersions {
    async execute(projectName: string, fileName: string): Promise<FileVersion[]> {
      return [
        {
          id: "version_1",
          fileId: "file_id_1",
          projectName: "any_project",
          fileName: "any_file",
          version: 1,
          content: "content_v1",
          size: 100,
          checksum: "checksum_1",
          createdAt: new Date("2025-01-01"),
          metadata: {
            encoding: "utf-8",
            mimeType: "text/plain",
            wordCount: 10,
            lineCount: 5,
            changeDescription: "Initial version",
            isAutoSave: false,
          }
        },
        {
          id: "version_2",
          fileId: "file_id_2",
          projectName: "any_project",
          fileName: "any_file",
          version: 2,
          content: "content_v2",
          size: 150,
          checksum: "checksum_2",
          createdAt: new Date("2025-01-02"),
          metadata: {
            encoding: "utf-8",
            mimeType: "text/plain",
            wordCount: 15,
            lineCount: 7,
            changeDescription: "Updated content",
            isAutoSave: false,
          }
        }
      ];
    }
  }
  return new GetFileVersionsStub();
};

const makeSut = () => {
  const getFileVersionsStub = makeGetFileVersionsStub();
  const sut = new GetFileVersionsController(getFileVersionsStub);
  return {
    sut,
    getFileVersionsStub,
  };
};

describe("GetFileVersionsController", () => {
  it("should return badRequest if projectName is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        fileName: "any_file",
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
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("fileName is required");
  });

  it("should call GetFileVersions with correct values", async () => {
    const { sut, getFileVersionsStub } = makeSut();
    const executeSpy = vi.spyOn(getFileVersionsStub, "execute");
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
      },
    };

    await sut.handle(request as any);

    expect(executeSpy).toHaveBeenCalledWith("any_project", "any_file");
  });

  it("should return ok with empty array if no versions found", async () => {
    const { sut, getFileVersionsStub } = makeSut();
    vi.spyOn(getFileVersionsStub, "execute").mockResolvedValueOnce([]);
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Found 0 versions for file any_file");
    expect(response.body.data.versions).toEqual([]);
    expect(response.body.data.totalVersions).toBe(0);
  });

  it("should return ok with versions data on success", async () => {
    const { sut } = makeSut();
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Found 2 versions for file any_file");
    expect(response.body.data.projectName).toBe("any_project");
    expect(response.body.data.fileName).toBe("any_file");
    expect(response.body.data.totalVersions).toBe(2);
    expect(response.body.data.versions).toHaveLength(2);
    
    expect(response.body.data.versions[0]).toEqual({
      version: 1,
      size: 100,
      checksum: "checksum_1",
      createdAt: new Date("2025-01-01"),
      metadata: {
        wordCount: 10,
        lineCount: 5,
        changeDescription: "Initial version",
        isAutoSave: false,
      }
    });

    expect(response.body.workflow.next_steps).toContain("Use 'memory_bank_read_version' to view a specific version's content");
    expect(response.body.workflow.next_steps).toContain("Use 'memory_bank_compare_versions' to compare two versions");
  });

  it("should return serverError if GetFileVersions throws", async () => {
    const { sut, getFileVersionsStub } = makeSut();
    vi.spyOn(getFileVersionsStub, "execute").mockRejectedValueOnce(new Error("Database error"));
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(500);
  });
});
