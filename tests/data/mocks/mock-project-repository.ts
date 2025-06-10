import { ProjectRepository } from "../../../src/data/protocols/project-repository.js";
import { Project } from "../../../src/domain/entities/project.js";
import { randomUUID } from 'crypto';

export class MockProjectRepository implements ProjectRepository {
  private projects: Project[] = [
    {
      id: randomUUID(),
      name: "project-1",
      description: "First mock project for testing",
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      fileCount: 2,
      totalSize: 42,
      metadata: {
        tags: ['mock', 'test'],
        owner: 'test-user',
        version: '1.0.0'
      }
    },
    {
      id: randomUUID(),
      name: "project-2",
      description: "Second mock project for testing",
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      fileCount: 2,
      totalSize: 44,
      metadata: {
        tags: ['mock', 'example'],
        owner: 'test-user',
        version: '1.0.0'
      }
    }
  ];

  async listProjects(): Promise<Project[]> {
    return [...this.projects];
  }

  async projectExists(name: string): Promise<boolean> {
    return this.projects.some(p => p.name === name);
  }

  async ensureProject(name: string): Promise<void> {
    const exists = await this.projectExists(name);
    if (!exists) {
      const newProject: Project = {
        id: randomUUID(),
        name,
        description: `Mock project: ${name}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        fileCount: 0,
        totalSize: 0,
        metadata: {
          tags: ['auto-created'],
          owner: 'system',
          version: '1.0.0'
        }
      };
      this.projects.push(newProject);
    }
  }
}
