import { DeleteProject, DeleteProjectParams } from '../../../domain/usecases/delete-project.js';
import { ProjectRepository } from '../../protocols/project-repository.js';

export class DbDeleteProject implements DeleteProject {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(params: DeleteProjectParams): Promise<boolean> {
    return this.projectRepository.deleteProject(params.name);
  }
}
