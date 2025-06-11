import { describe, it, expect, beforeEach } from 'vitest';
import { DbDeleteFile } from '../../../../src/data/usecases/delete-file/db-delete-file.js';
import { MockFileRepository } from '../../mocks/mock-file-repository.js';

describe('DbDeleteFile', () => {
  let deleteFile: DbDeleteFile;
  let mockFileRepository: MockFileRepository;

  beforeEach(() => {
    mockFileRepository = new MockFileRepository();
    deleteFile = new DbDeleteFile(mockFileRepository);
  });

  it('should delete existing file successfully', async () => {
    const result = await deleteFile.execute({
      projectName: 'project-1',
      filePath: 'file1.md'
    });

    expect(result).toBe(true);
  });

  it('should return false when trying to delete non-existent file', async () => {
    const result = await deleteFile.execute({
      projectName: 'project-1',
      filePath: 'nonexistent.md'
    });

    expect(result).toBe(false);
  });

  it('should return false when project does not exist', async () => {
    const result = await deleteFile.execute({
      projectName: 'nonexistent-project',
      filePath: 'file.md'
    });

    expect(result).toBe(false);
  });
});
