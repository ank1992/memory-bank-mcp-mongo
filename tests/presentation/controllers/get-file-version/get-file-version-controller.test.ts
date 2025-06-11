import { describe, expect, it, vi } from "vitest";
import { GetFileVersionController, GetFileVersionRequest } from "../../../../src/presentation/controllers/get-file-version/get-file-version-controller.js";
import { GetFileVersion } from "../../../../src/domain/usecases/file-versioning.js";
import { FileVersion } from "../../../../src/domain/entities/file-version.js";
import { NotFoundError } from "../../../../src/presentation/errors/index.js";

const makeGetFileVersionStub = (): GetFileVersion => {
  class GetFileVersionStub implements GetFileVersion {
    async execute(projectName: string, fileName: string, version: number): Promise<FileVersion | null> {
      return {
        id: "any_id",
        fileId: "any_file_id",
        projectName: "any_project",
        fileName: "any_file",
        version: 1,
        content: "any_content",
        size: 100,
        checksum: "any_checksum",
        createdAt: new Date("2025-01-01"),
        metadata: {
          encoding: "utf-8",
          mimeType: "text/plain",
          wordCount: 10,
          lineCount: 5,
          keywords: ["test"],
          summary: "test file",
          changeDescription: "Initial version",
          isAutoSave: false,
        }
      };
    }
  }
  return new GetFileVersionStub();
};

const makeSut = () => {
  const getFileVersionStub = makeGetFileVersionStub();
  const sut = new GetFileVersionController(getFileVersionStub);
  return {
    sut,
    getFileVersionStub,
  };
};

describe("GetFileVersionController", () => {
  it("should return badRequest if projectName is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        fileName: "any_file",
        version: 1,
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
        version: 1,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("fileName is required");
  });

  it("should return badRequest if version is not provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("version is required");
  });

  it("should return badRequest if version is not a positive integer", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version: -1,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Version must be a positive integer");
  });

  it("should return notFound if file version does not exist", async () => {
    const { sut, getFileVersionStub } = makeSut();
    vi.spyOn(getFileVersionStub, "execute").mockResolvedValueOnce(null);
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version: 1,
      },
    };

    const response = await sut.handle(request as any);    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(new NotFoundError("Version 1 not found for file any_file in project any_project"));
  });

  it("should call GetFileVersion with correct values", async () => {
    const { sut, getFileVersionStub } = makeSut();
    const executeSpy = vi.spyOn(getFileVersionStub, "execute");
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version: 1,
      },
    };

    await sut.handle(request as any);

    expect(executeSpy).toHaveBeenCalledWith("any_project", "any_file", 1);
  });

  it("should return ok with file version data on success", async () => {
    const { sut } = makeSut();
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version: 1,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Retrieved version 1 of file any_file");
    expect(response.body.data).toEqual({
      projectName: "any_project",
      fileName: "any_file",
      version: 1,
      content: "any_content",
      size: 100,
      checksum: "any_checksum",
      createdAt: new Date("2025-01-01"),
      metadata: {
        encoding: "utf-8",
        mimeType: "text/plain",
        wordCount: 10,
        lineCount: 5,
        keywords: ["test"],
        summary: "test file",
        changeDescription: "Initial version",
        isAutoSave: false,
      }
    });
    expect(response.body.workflow.next_steps).toContain("Use 'memory_bank_revert_file_to_version' to restore this version as current");
  });

  it("should return serverError if GetFileVersion throws", async () => {
    const { sut, getFileVersionStub } = makeSut();
    vi.spyOn(getFileVersionStub, "execute").mockRejectedValueOnce(new Error("Database error"));
    
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        version: 1,
      },
    };

    const response = await sut.handle(request as any);

    expect(response.statusCode).toBe(500);
  });
});
