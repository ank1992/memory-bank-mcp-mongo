import { describe, it, expect, beforeEach } from 'vitest';
import { DbGetProjectStats } from '../../../../src/data/usecases/get-project-stats/db-get-project-stats.js';
import { MockFileRepository } from '../../mocks/mock-file-repository.js';

describe('DbGetProjectStats', () => {
  let getProjectStats: DbGetProjectStats;
  let mockFileRepository: MockFileRepository;

  beforeEach(() => {
    mockFileRepository = new MockFileRepository();
    getProjectStats = new DbGetProjectStats(mockFileRepository);
  });

  it('should return correct stats for existing project', async () => {
    const result = await getProjectStats.execute({
      projectName: 'project-1'
    });

    expect(result.fileCount).toBe(2);
    expect(result.totalSize).toBeGreaterThan(0);
  });

  it('should return zero stats for non-existent project', async () => {
    const result = await getProjectStats.execute({
      projectName: 'nonexistent-project'
    });

    expect(result.fileCount).toBe(0);
    expect(result.totalSize).toBe(0);
  });
});
