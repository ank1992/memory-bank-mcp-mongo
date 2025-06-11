import { describe, it, expect, vi } from 'vitest';
import { DbCompareFileVersions } from '../../../../src/data/usecases/compare-file-versions/db-compare-file-versions.js';
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
      // Return different content based on version for testing
      if (version === 1) {
        return {
          id: 'version-1',
          fileId: 'file-id',
          projectName,
          fileName,
          version: 1,
          content: 'Line 1\nLine 2\nLine 3',
          createdAt: new Date(),
          size: 100,
          checksum: 'abc123'
        };
      } else if (version === 2) {
        return {
          id: 'version-2',
          fileId: 'file-id',
          projectName,
          fileName,
          version: 2,
          content: 'Line 1\nModified Line 2\nLine 3\nNew Line 4',
          createdAt: new Date(),
          size: 120,
          checksum: 'def456'
        };
      }
      return null;
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
  sut: DbCompareFileVersions;
  fileVersionRepositoryStub: FileVersionRepository;
}

const makeSut = (): SutTypes => {
  const fileVersionRepositoryStub = makeFileVersionRepositoryStub();
  const sut = new DbCompareFileVersions(fileVersionRepositoryStub);
  return {
    sut,
    fileVersionRepositoryStub
  };
};

describe('DbCompareFileVersions', () => {
  it('should call FileVersionRepository getVersion for both versions', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const getVersionSpy = vi.spyOn(fileVersionRepositoryStub, 'getVersion');

    await sut.execute('test-project', 'test-file.md', 1, 2);

    expect(getVersionSpy).toHaveBeenCalledWith('test-project', 'test-file.md', 1);
    expect(getVersionSpy).toHaveBeenCalledWith('test-project', 'test-file.md', 2);
    expect(getVersionSpy).toHaveBeenCalledTimes(2);
  });
  it('should return null if first version does not exist', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockImplementation(async (projectName, fileName, version) => {
      if (version === 999) return null;
      return {
        id: 'version-2',
        fileId: 'file-id',
        projectName,
        fileName,
        version: 2,
        content: 'Some content',
        createdAt: new Date(),
        size: 100,
        checksum: 'abc123'
      };
    });

    const result = await sut.execute('test-project', 'test-file.md', 999, 2);

    expect(result).toBeNull();
  });
  it('should return null if second version does not exist', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockImplementation(async (projectName, fileName, version) => {
      if (version === 999) return null;
      return {
        id: 'version-1',
        fileId: 'file-id',
        projectName,
        fileName,
        version: 1,
        content: 'Some content',
        createdAt: new Date(),
        size: 100,
        checksum: 'abc123'
      };
    });

    const result = await sut.execute('test-project', 'test-file.md', 1, 999);

    expect(result).toBeNull();
  });

  it('should return comparison result with differences when both versions exist', async () => {
    const { sut } = makeSut();

    const result = await sut.execute('test-project', 'test-file.md', 1, 2);

    expect(result).toBeDefined();
    expect(result!.version1Content).toBe('Line 1\nLine 2\nLine 3');
    expect(result!.version2Content).toBe('Line 1\nModified Line 2\nLine 3\nNew Line 4');
    expect(result!.differences).toHaveLength(2);
    
    // Check modification difference
    expect(result!.differences[0]).toEqual({
      type: 'modification',
      line: 2,
      content: 'From: "Line 2" To: "Modified Line 2"'
    });
    
    // Check addition difference
    expect(result!.differences[1]).toEqual({
      type: 'addition',
      line: 4,
      content: 'New Line 4'
    });
  });
  it('should handle identical content with no differences', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const identicalContent = 'Same content\nLine 2\nLine 3';
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockResolvedValue({
      id: 'version-1',
      fileId: 'file-id',
      projectName: 'test-project',
      fileName: 'test-file.md',
      version: 1,
      content: identicalContent,
      createdAt: new Date(),
      size: 100,
      checksum: 'abc123'
    });

    const result = await sut.execute('test-project', 'test-file.md', 1, 2);

    expect(result).toBeDefined();
    expect(result!.differences).toHaveLength(0);
    expect(result!.version1Content).toBe(identicalContent);
    expect(result!.version2Content).toBe(identicalContent);
  });  it('should handle deletions correctly', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockImplementation(async (projectName, fileName, version) => {
      if (version === 1) {
        return {
          id: 'version-1',
          fileId: 'file-id',
          projectName,
          fileName,
          version: 1,
          content: 'Line 1\nLine 2\nLine 3\nLine 4',
          createdAt: new Date(),
          size: 100,
          checksum: 'abc123'
        };
      } else {
        return {
          id: 'version-2',
          fileId: 'file-id',
          projectName,
          fileName,
          version: 2,
          content: 'Line 1\nLine 3',
          createdAt: new Date(),
          size: 80,
          checksum: 'def456'
        };
      }
    });

    const result = await sut.execute('test-project', 'test-file.md', 1, 2);

    expect(result).toBeDefined();
    expect(result!.differences).toHaveLength(3);
    
    // Should detect deletion/modification of Line 2, Line 3 becomes Line 2, and Line 4 is deleted
    expect(result!.differences[0]).toEqual({
      type: 'modification',
      line: 2,
      content: 'From: "Line 2" To: "Line 3"'
    });
    
    expect(result!.differences[1]).toEqual({
      type: 'deletion',
      line: 3,
      content: 'Line 3'
    });

    expect(result!.differences[2]).toEqual({
      type: 'deletion',
      line: 4,
      content: 'Line 4'
    });
  });
  it('should handle empty files', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockImplementation(async (projectName, fileName, version) => {
      return {
        id: `version-${version}`,
        fileId: 'file-id',
        projectName,
        fileName,
        version,
        content: '',
        createdAt: new Date(),
        size: 0,
        checksum: 'empty'
      };
    });

    const result = await sut.execute('test-project', 'empty-file.md', 1, 2);

    expect(result).toBeDefined();
    expect(result!.version1Content).toBe('');
    expect(result!.version2Content).toBe('');
    expect(result!.differences).toHaveLength(0);
  });

  it('should throw when repository throws', async () => {
    const { sut, fileVersionRepositoryStub } = makeSut();
    const error = new Error('Database connection error');
    vi.spyOn(fileVersionRepositoryStub, 'getVersion').mockRejectedValueOnce(error);

    await expect(sut.execute('test-project', 'test-file.md', 1, 2)).rejects.toThrow('Database connection error');
  });
});
