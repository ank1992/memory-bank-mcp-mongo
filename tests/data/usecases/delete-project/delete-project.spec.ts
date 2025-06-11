import { describe, it, expect, beforeEach } from 'vitest';
import { DbDeleteProject } from '../../../../src/data/usecases/delete-project/db-delete-project.js';
import { MockProjectRepository } from '../../mocks/mock-project-repository.js';

describe('DbDeleteProject', () => {
  let deleteProject: DbDeleteProject;
  let mockProjectRepository: MockProjectRepository;

  beforeEach(() => {
    mockProjectRepository = new MockProjectRepository();
    deleteProject = new DbDeleteProject(mockProjectRepository);
  });

  it('should delete existing project successfully', async () => {
    const result = await deleteProject.execute({
      name: 'project-1'
    });

    expect(result).toBe(true);
  });

  it('should return false when trying to delete non-existent project', async () => {
    const result = await deleteProject.execute({
      name: 'nonexistent-project'
    });

    expect(result).toBe(false);
  });
});
