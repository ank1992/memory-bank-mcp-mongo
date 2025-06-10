import { beforeEach, describe, expect, test, vi } from "vitest";
import { FileRepository } from "../../../../src/data/protocols/file-repository.js";
import { ProjectRepository } from "../../../../src/data/protocols/project-repository.js";
import { MergeFiles } from "../../../../src/data/usecases/merge-files/merge-files.js";
import { MergeFilesParams } from "../../../../src/domain/usecases/merge-files.js";
import { File } from "../../../../src/domain/entities/file.js";
import {
  MockFileRepository,
  MockProjectRepository,
} from "../../mocks/index.js";

describe("MergeFiles UseCase", () => {
  let sut: MergeFiles;
  let fileRepositoryStub: FileRepository;
  let projectRepositoryStub: ProjectRepository;

  beforeEach(() => {
    fileRepositoryStub = new MockFileRepository();
    projectRepositoryStub = new MockProjectRepository();
    sut = new MergeFiles(fileRepositoryStub, projectRepositoryStub);
  });

  test("should call ProjectRepository.projectExists with correct projectName", async () => {
    const projectExistsSpy = vi.spyOn(projectRepositoryStub, "projectExists");
    const params: MergeFilesParams = {
      projectName: "project-1",
    };

    await sut.mergeFiles(params);

    expect(projectExistsSpy).toHaveBeenCalledWith("project-1");
  });

  test("should return null if project does not exist", async () => {
    vi.spyOn(projectRepositoryStub, "projectExists").mockResolvedValueOnce(
      false
    );
    const params: MergeFilesParams = {
      projectName: "non-existent-project",
    };

    const result = await sut.mergeFiles(params);

    expect(result).toBeNull();
  });

  test("should call FileRepository.listFiles with correct projectName if project exists", async () => {
    vi.spyOn(projectRepositoryStub, "projectExists").mockResolvedValueOnce(
      true
    );
    const listFilesSpy = vi.spyOn(fileRepositoryStub, "listFiles");
    const params: MergeFilesParams = {
      projectName: "project-1",
    };

    await sut.mergeFiles(params);

    expect(listFilesSpy).toHaveBeenCalledWith("project-1");
  });

  test("should return null if project has no files", async () => {
    vi.spyOn(projectRepositoryStub, "projectExists").mockResolvedValueOnce(
      true
    );
    vi.spyOn(fileRepositoryStub, "listFiles").mockResolvedValueOnce([]);
    const params: MergeFilesParams = {
      projectName: "empty-project",
    };

    const result = await sut.mergeFiles(params);

    expect(result).toBeNull();
  });

  test("should create merged file with default name if outputFileName not provided", async () => {
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
    };

    await sut.mergeFiles(params);

    expect(writeFileSpy).toHaveBeenCalledWith(
      "project-1",
      "merged-summary.md",
      expect.any(String)
    );
  });

  test("should create merged file with custom outputFileName when provided", async () => {
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
      outputFileName: "custom-merge.md",
    };

    await sut.mergeFiles(params);

    expect(writeFileSpy).toHaveBeenCalledWith(
      "project-1",
      "custom-merge.md",
      expect.any(String)
    );
  });

  test("should generate markdown content by default", async () => {
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
    };

    await sut.mergeFiles(params);

    const mergedContent = writeFileSpy.mock.calls[0][2] as string;
    expect(mergedContent).toContain("# 📋 Project Summary - Merged Files");
    expect(mergedContent).toContain("## 📑 Table of Contents");
    expect(mergedContent).toContain("## 📊 Summary Statistics");
  });

  test("should generate plain text content when format is 'plain'", async () => {
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
      format: "plain",
    };

    await sut.mergeFiles(params);

    const mergedContent = writeFileSpy.mock.calls[0][2] as string;
    expect(mergedContent).toContain("PROJECT SUMMARY - MERGED FILES");
    expect(mergedContent).toContain("========================================");
    expect(mergedContent).not.toContain("# 📋");
  });

  test("should include metadata when includeMetadata is true", async () => {
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
      includeMetadata: true,
    };

    await sut.mergeFiles(params);

    const mergedContent = writeFileSpy.mock.calls[0][2] as string;
    expect(mergedContent).toContain("**📄 File Metadata:**");
    expect(mergedContent).toContain("**Size:**");
    expect(mergedContent).toContain("**Created:**");
    expect(mergedContent).toContain("**Updated:**");
  });

  test("should exclude metadata when includeMetadata is false", async () => {
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
      includeMetadata: false,
    };

    await sut.mergeFiles(params);

    const mergedContent = writeFileSpy.mock.calls[0][2] as string;
    expect(mergedContent).not.toContain("**📄 File Metadata:**");
    expect(mergedContent).not.toContain("**Size:**");
  });

  test("should include all files content in merged output", async () => {
    // Create mock files
    const mockFiles: File[] = [
      {
        id: "1",
        name: "intro.md",
        content: "# Introduction\nThis is the intro section.",
        projectName: "project-1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        size: 42,
        checksum: "hash1",
        metadata: {
          encoding: "utf-8",
          mimeType: "text/markdown",
        },
      },
      {
        id: "2",
        name: "details.md",
        content: "## Details\nHere are the details.",
        projectName: "project-1",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
        size: 28,
        checksum: "hash2",
        metadata: {
          encoding: "utf-8",
          mimeType: "text/markdown",
        },
      },
    ];

    vi.spyOn(fileRepositoryStub, "listFiles").mockResolvedValueOnce(mockFiles);
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
    };

    await sut.mergeFiles(params);

    const mergedContent = writeFileSpy.mock.calls[0][2] as string;
    expect(mergedContent).toContain("intro.md");
    expect(mergedContent).toContain("details.md");
    expect(mergedContent).toContain("# Introduction");
    expect(mergedContent).toContain("## Details");
  });

  test("should return merged file on success", async () => {
    const mockMergedFile: File = {
      id: "merged-1",
      name: "merged-summary.md",
      content: "merged content",
      projectName: "project-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      size: 100,
      checksum: "merged-hash",
      metadata: {
        encoding: "utf-8",
        mimeType: "text/markdown",
      },
    };

    vi.spyOn(fileRepositoryStub, "writeFile").mockResolvedValueOnce(
      mockMergedFile
    );
    const params: MergeFilesParams = {
      projectName: "project-1",
    };

    const result = await sut.mergeFiles(params);

    expect(result).toEqual(mockMergedFile);
    expect(result?.name).toBe("merged-summary.md");
    expect(result?.content).toBe("merged content");
  });

  test("should propagate errors if repository throws", async () => {
    const error = new Error("Repository error");
    vi.spyOn(projectRepositoryStub, "projectExists").mockRejectedValueOnce(
      error
    );
    const params: MergeFilesParams = {
      projectName: "project-1",
    };

    await expect(sut.mergeFiles(params)).rejects.toThrow(error);
  });

  test("should include summary statistics in markdown format", async () => {
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
      format: "markdown",
    };

    await sut.mergeFiles(params);

    const mergedContent = writeFileSpy.mock.calls[0][2] as string;
    expect(mergedContent).toContain("## 📊 Summary Statistics");
    expect(mergedContent).toContain("**📁 Total files:**");
    expect(mergedContent).toContain("**📏 Total size:**");
    expect(mergedContent).toContain("*This merged document contains all files from the project for easy review.*");
  });

  test("should include summary statistics in plain format", async () => {
    const writeFileSpy = vi.spyOn(fileRepositoryStub, "writeFile");
    const params: MergeFilesParams = {
      projectName: "project-1",
      format: "plain",
    };

    await sut.mergeFiles(params);

    const mergedContent = writeFileSpy.mock.calls[0][2] as string;
    expect(mergedContent).toContain("SUMMARY STATISTICS");
    expect(mergedContent).toContain("Total files:");
    expect(mergedContent).toContain("Total size:");
  });
});
