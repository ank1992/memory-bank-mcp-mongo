import { describe, expect, it, vi } from "vitest";
import { UpdateRequest } from "../../../../src/presentation/controllers/update/protocols.js";
import { UpdateController } from "../../../../src/presentation/controllers/update/update-controller.js";
import {
  NotFoundError,
  UnexpectedError,
} from "../../../../src/presentation/errors/index.js";
import { makeUpdateFileUseCase, makeValidator, makeContextChecker } from "../../mocks/index.js";

const makeSut = () => {
  const validatorStub = makeValidator<UpdateRequest>();
  const updateFileUseCaseStub = makeUpdateFileUseCase();
  const contextCheckerStub = makeContextChecker();
  const sut = new UpdateController(updateFileUseCaseStub, validatorStub, contextCheckerStub);
  return {
    sut,
    validatorStub,
    updateFileUseCaseStub,
    contextCheckerStub,
  };
};

describe("UpdateController", () => {
  it("should call validator with correct values", async () => {
    const { sut, validatorStub } = makeSut();
    const validateSpy = vi.spyOn(validatorStub, "validate");
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        content: "any_content",
      },
    };
    await sut.handle(request);
    expect(validateSpy).toHaveBeenCalledWith(request.body);
  });

  it("should return 400 if validator returns an error", async () => {
    const { sut, validatorStub } = makeSut();
    vi.spyOn(validatorStub, "validate").mockReturnValueOnce(
      new Error("any_error")
    );
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        content: "any_content",
      },
    };
    const response = await sut.handle(request);
    expect(response).toEqual({
      statusCode: 400,
      body: new Error("any_error"),
    });
  });
  it("should call UpdateFileUseCase with correct values", async () => {
    const { sut, updateFileUseCaseStub } = makeSut();
    const updateFileSpy = vi.spyOn(updateFileUseCaseStub, "updateFile");
    const request = {
      body: {
        projectName: "project-1",
        fileName: "file1.md",
        content: "any_content",
      },
    };
    await sut.handle(request);
    expect(updateFileSpy).toHaveBeenCalledWith({
      projectName: "project-1",
      fileName: "file1.md",
      content: "any_content",
    });
  });

  it("should return 404 if UpdateFileUseCase returns null", async () => {
    const { sut, updateFileUseCaseStub } = makeSut();
    vi.spyOn(updateFileUseCaseStub, "updateFile").mockResolvedValueOnce(null);
    const request = {
      body: {
        projectName: "any_project",
        fileName: "any_file",
        content: "any_content",
      },
    };
    const response = await sut.handle(request);    expect(response.statusCode).toBe(404);
    expect(response.body).toBeInstanceOf(NotFoundError);
  });  it("should return 500 if UpdateFileUseCase throws", async () => {
    const { sut, updateFileUseCaseStub, contextCheckerStub } = makeSut();
    // Mock context check to pass, then mock use case to throw
    vi.spyOn(contextCheckerStub, "checkProjectContext").mockResolvedValueOnce({
      currentProject: "project-1",
      availableProjects: ["project-1"],
      projectFiles: ["file1.md"],
      suggestedFileName: "file1.md",
      existingContent: "existing content",
      projectExists: true,
      fileExists: true,
    });
    vi.spyOn(updateFileUseCaseStub, "updateFile").mockRejectedValueOnce(
      new Error("any_error")
    );
    const request = {
      body: {
        projectName: "project-1",
        fileName: "file1.md",
        content: "any_content",
      },
    };
    const response = await sut.handle(request);
    expect(response).toEqual({
      statusCode: 500,
      body: new UnexpectedError(new Error("any_error")),
    });
  });

  it("should return 200 if valid data is provided", async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        projectName: "project-1",
        fileName: "file1.md",
        content: "any_content",
      },
    };
    const response = await sut.handle(request);
    expect(response).toEqual({
      statusCode: 200,
      body: {
        message: expect.stringContaining("File file1.md updated successfully in project project-1"),
        projectName: "project-1",
        fileName: "file1.md",
        contextCheck: expect.any(Object),
        contextInfo: expect.any(String),
        recommendation: expect.any(String),
      },
    });
  });
});
