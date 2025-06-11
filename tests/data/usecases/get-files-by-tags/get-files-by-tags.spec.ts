import { describe, it, expect, beforeEach } from 'vitest';
import { DbGetFilesByTags } from '../../../../src/data/usecases/get-files-by-tags/db-get-files-by-tags.js';
import { MockFileRepository } from '../../mocks/mock-file-repository.js';

describe('DbGetFilesByTags', () => {
  let getFilesByTags: DbGetFilesByTags;
  let mockFileRepository: MockFileRepository;

  beforeEach(() => {
    mockFileRepository = new MockFileRepository();
    getFilesByTags = new DbGetFilesByTags(mockFileRepository);
  });

  it('should return files with matching tags', async () => {
    const result = await getFilesByTags.getFilesByTags({
      projectName: 'project-1',
      tags: ['mock']
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('file1.md');
    expect(result[0].metadata?.tags).toContain('mock');
  });

  it('should return empty array when no files have matching tags', async () => {
    const result = await getFilesByTags.getFilesByTags({
      projectName: 'project-1',
      tags: ['nonexistent']
    });

    expect(result).toHaveLength(0);
  });

  it('should return empty array when project does not exist', async () => {
    const result = await getFilesByTags.getFilesByTags({
      projectName: 'nonexistent-project',
      tags: ['mock']
    });

    expect(result).toHaveLength(0);
  });
});
