import { GetFilesByTagsUseCase, GetFilesByTagsParams } from '../../../domain/usecases/get-files-by-tags.js';
import { File } from '../../../domain/entities/file.js';
import { FileRepository } from '../../protocols/file-repository.js';

export class DbGetFilesByTags implements GetFilesByTagsUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  async getFilesByTags(params: GetFilesByTagsParams): Promise<File[]> {
    return this.fileRepository.getFilesByTags(params.projectName, params.tags);
  }
}
