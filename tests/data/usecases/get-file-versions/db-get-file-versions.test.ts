import { describe, expect, it, vi } from "vitest";
import { DbGetFileVersions } from "../../../../src/data/usecases/get-file-versions/db-get-file-versions.js";
import { FileVersionRepository } from "../../../../src/data/protocols/file-version-repository.js";
import { FileVersion, VersioningConfig } from "../../../../src/domain/entities/file-version.js";

const makeFileVersionRepositoryStub = (): FileVersionRepository => {
  class FileVersionRepositoryStub implements FileVersionRepository {
    async createVersion(fileVersion: Omit<FileVersion, 'id'>): Promise<FileVersion> {
      return Promise.resolve({
        id: 'version-id',
        ...fileVersion
      });
    }

    async getVersions(projectName: string, fileName: string): Promise<FileVersion[]> {
      return [
        {
          id: "version_1",
          fileId: "file-id",
          projectName,
          fileName,
          version: 1,
          content: "content_v1",
          size: 100,
          checksum: "hash_1",
          createdAt: new Date("2025-01-01")
        },
        {
          id: "version_2",
          fileId: "file-id",
          projectName,
          fileName,
          version: 2,
          content: "content_v2",
          size: 150,
          checksum: "hash_2",
          createdAt: new Date("2025-01-02")
        }
      ];
    }

    async getVersion(projectName: string, fileName: string, version: number): Promise<FileVersion | null> {
      return Promise.resolve(null);
    }

    async getLatestVersionNumber(projectName: string, fileName: string): Promise<number> {
      return Promise.resolve(1);
    }

    async cleanupOldVersions(projectName: string, fileName: string, config: VersioningConfig): Promise<number> {
      return Promise.resolve(0);
    }

    async deleteAllVersions(projectName: string, fileName: string): Promise<boolean> {
      return Promise.resolve(true);
    }

    async deleteProjectVersions(projectName: string): Promise<boolean> {
      return Promise.resolve(true);
    }

    async deleteOldVersions(): Promise<number> {
      return Promise.resolve(0);
    }
  }
  return new FileVersionRepositoryStub();
};

const makeSut = () => {
  const fileVersionRepositoryStub = makeFileVersionRepositoryStub();
  const sut = new DbGetFileVersions(fileVersionRepositoryStub);
  return {
    sut,
    fileVersionRepositoryStub,
  };
};

describe("DbGetFileVersions", () => {
  it("should call FileVersionRepository.getVersions with correct values", async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const getVersionsSpy = vi.spyOn(fileVersionRepositoryStub, "getVersions");
    
    await sut.execute("any_project", "any_file");

    expect(getVersionsSpy).toHaveBeenCalledWith("any_project", "any_file");
  });
  it("should return file versions on success", async () => {
    const { sut } = makeSut();
    
    const result = await sut.execute("test_project", "test_file");

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "version_1",
      fileId: "file-id",
      projectName: "test_project",
      fileName: "test_file",
      version: 1,
      content: "content_v1",
      size: 100,
      checksum: "hash_1",
      createdAt: new Date("2025-01-01")
    });
    expect(result[1].version).toBe(2);
  });

  it("should return empty array if no versions found", async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    vi.spyOn(fileVersionRepositoryStub, "getVersions").mockResolvedValueOnce([]);
    
    const result = await sut.execute("nonexistent_project", "nonexistent_file");

    expect(result).toEqual([]);
  });

  it("should throw if FileVersionRepository throws", async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    vi.spyOn(fileVersionRepositoryStub, "getVersions").mockRejectedValueOnce(new Error("Database error"));
    
    await expect(sut.execute("any_project", "any_file")).rejects.toThrow("Database error");
  });
});
