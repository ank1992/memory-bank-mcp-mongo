import { DeleteFile, DeleteFileParams } from '../../../domain/usecases/delete-file.js';
import { FileRepository } from '../../protocols/file-repository.js';

export class DbDeleteFile implements DeleteFile {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(params: DeleteFileParams): Promise<boolean> {
    return this.fileRepository.deleteFile(params.projectName, params.filePath);
  }
}
