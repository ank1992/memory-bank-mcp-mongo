import { GetProjectStats, GetProjectStatsParams, ProjectStats } from '../../../domain/usecases/get-project-stats.js';
import { FileRepository } from '../../protocols/file-repository.js';

export class DbGetProjectStats implements GetProjectStats {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(params: GetProjectStatsParams): Promise<ProjectStats> {
    return this.fileRepository.getProjectStats(params.projectName);
  }
}
