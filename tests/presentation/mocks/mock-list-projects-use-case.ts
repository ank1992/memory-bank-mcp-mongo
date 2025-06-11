import { ListProjectsUseCase } from "../../../src/domain/usecases/list-projects.js";
import { Project } from "../../../src/domain/entities/project.js";

export class MockListProjectsUseCase implements ListProjectsUseCase {
  async listProjects(): Promise<Project[]> {
    return [
      {
        id: "1",
        name: "project1",
        description: "First test project",
        createdAt: new Date(),
        updatedAt: new Date(),
        fileCount: 1,
        totalSize: 100,
        metadata: { tags: ["test"] }
      },
      {
        id: "2", 
        name: "project2",
        description: "Second test project",
        createdAt: new Date(),
        updatedAt: new Date(),
        fileCount: 2,
        totalSize: 200,
        metadata: { tags: ["test"] }
      }
    ];
  }
}

export const makeListProjectsUseCase = (): ListProjectsUseCase => {
  return new MockListProjectsUseCase();
};
