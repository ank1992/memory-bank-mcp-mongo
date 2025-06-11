import { describe, it, expect, vi } from 'vitest';
import { DbGetFileVersion } from '../../../../src/data/usecases/get-file-version/db-get-file-version.js';
import { FileVersionRepository } from '../../../../src/data/protocols/file-version-repository.js';
import { FileVersion, VersioningConfig } from '../../../../src/domain/entities/file-version.js';

const makeFileVersionRepositoryStub = (): FileVersionRepository => {
  class FileVersionRepositoryStub implements FileVersionRepository {
    async createVersion(fileVersion: Omit<FileVersion, 'id'>): Promise<FileVersion> {
      return Promise.resolve({
        id: 'version-id',
        ...fileVersion
      });
    }

    async getVersions(projectName: string, fileName: string): Promise<FileVersion[]> {
      return Promise.resolve([]);
    }

    async getVersion(projectName: string, fileName: string, version: number): Promise<FileVersion | null> {
      return Promise.resolve({
        id: 'version-1',
        fileId: 'file-id',
        projectName,
        fileName,
        version,
        content: 'file content',
        createdAt: new Date(),
        size: 100,
        checksum: 'abc123'
      });
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

interface SutTypes {
  sut: DbGetFileVersion;
  fileVersionRepositoryStub: FileVersionRepository;
}

const makeSut = (): SutTypes => {
  const fileVersionRepositoryStub = makeFileVersionRepositoryStub();
  const sut = new DbGetFileVersion(fileVersionRepositoryStub);
  return {
    sut,
    fileVersionRepositoryStub
  };
};

describe('DbGetFileVersion', () => {
  it('should call FileVersionRepository getVersion with correct parameters', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const getVersionSpy = vi.spyOn(fileVersionRepositoryStub, 'getVersion');

    await sut.execute('test-project', 'test-file.md', 3);

    expect(getVersionSpy).toHaveBeenCalledWith('test-project', 'test-file.md', 3);
  });
  it('should return FileVersion when repository returns a version', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const mockFileVersion: FileVersion = {
      id: 'version-123',
      fileId: 'file-id',
      projectName: 'my-project',
      fileName: 'document.md',
      version: 5,
      content: 'This is the content of version 5',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      size: 200,
      checksum: 'def456'
    };
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockResolvedValueOnce(mockFileVersion);

    const result = await sut.execute('my-project', 'document.md', 5);

    expect(result).toEqual(mockFileVersion);
  });

  it('should return null when repository returns null', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockResolvedValueOnce(null);

    const result = await sut.execute('non-existent-project', 'missing-file.md', 1);

    expect(result).toBeNull();
  });

  it('should throw when repository throws', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const error = new Error('Database connection error');
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockRejectedValueOnce(error);

    await expect(sut.execute('test-project', 'test-file.md', 1)).rejects.toThrow('Database connection error');
  });

  it('should handle special characters in project and file names', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const getVersionSpy = vi.spyOn(fileVersionRepositoryStub, 'getVersion');

    await sut.execute('project-with-special-chars-@#$', 'file with spaces & symbols.md', 2);

    expect(getVersionSpy).toHaveBeenCalledWith('project-with-special-chars-@#$', 'file with spaces & symbols.md', 2);
  });

  it('should handle version 0', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const getVersionSpy = vi.spyOn(fileVersionRepositoryStub, 'getVersion');

    await sut.execute('test-project', 'test-file.md', 0);

    expect(getVersionSpy).toHaveBeenCalledWith('test-project', 'test-file.md', 0);
  });

  it('should handle large version numbers', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const getVersionSpy = vi.spyOn(fileVersionRepositoryStub, 'getVersion');
    const largeVersion = 999999;

    await sut.execute('test-project', 'test-file.md', largeVersion);

    expect(getVersionSpy).toHaveBeenCalledWith('test-project', 'test-file.md', largeVersion);
  });
});
