import { describe, it, expect, vi } from 'vitest';
import { CleanupOldVersionsController } from '../../../../src/presentation/controllers/cleanup-old-versions/cleanup-old-versions-controller.js';
import { CleanupOldVersions } from '../../../../src/domain/usecases/file-versioning.js';
import { Request } from '../../../../src/presentation/protocols/index.js';
import { UnexpectedError } from '../../../../src/presentation/errors/index.js';

const makeCleanupOldVersionsStub = (): CleanupOldVersions => {
  class CleanupOldVersionsStub implements CleanupOldVersions {
    async execute(projectName: string, maxVersionsPerFile?: number): Promise<number> {
      return 5; // Return number of deleted versions
    }
  }
  return new CleanupOldVersionsStub();
};

interface SutTypes {
  sut: CleanupOldVersionsController;
  cleanupOldVersionsStub: CleanupOldVersions;
}

const makeSut = (): SutTypes => {
  const cleanupOldVersionsStub = makeCleanupOldVersionsStub();
  const sut = new CleanupOldVersionsController(cleanupOldVersionsStub);
  return {
    sut,
    cleanupOldVersionsStub
  };
};

describe('CleanupOldVersionsController', () => {
  it('should return 400 if no projectName is provided', async () => {
    const { sut } = makeSut();
    const request: Request<any> = {
      body: {
        maxVersionsPerFile: 5
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('projectName is required');
  });

  it('should call CleanupOldVersions with correct parameters when maxVersionsPerFile is provided', async () => {
    const { sut, cleanupOldVersionsStub } = makeSut();
    const executeSpy = vi.spyOn(cleanupOldVersionsStub, 'execute');
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        maxVersionsPerFile: 8
      }
    };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledWith('test-project', 8);
  });

  it('should call CleanupOldVersions with default maxVersionsPerFile when not provided', async () => {
    const { sut, cleanupOldVersionsStub } = makeSut();
    const executeSpy = vi.spyOn(cleanupOldVersionsStub, 'execute');
    const request: Request<any> = {
      body: {
        projectName: 'test-project'
      }
    };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledWith('test-project', undefined);
  });

  it('should return 200 with cleanup results when successful', async () => {
    const { sut, cleanupOldVersionsStub } = makeSut();
    vi.spyOn(cleanupOldVersionsStub, 'execute').mockResolvedValueOnce(12);
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        maxVersionsPerFile: 5
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Successfully cleaned up old versions in project 'test-project'");
    expect(response.body.deletedVersions).toBe(12);
    expect(response.body.maxVersionsPerFile).toBe(5);
    expect(response.body.projectName).toBe('test-project');
  });

  it('should return default maxVersionsPerFile of 10 when not provided', async () => {
    const { sut, cleanupOldVersionsStub } = makeSut();
    vi.spyOn(cleanupOldVersionsStub, 'execute').mockResolvedValueOnce(3);
    const request: Request<any> = {
      body: {
        projectName: 'test-project'
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body.maxVersionsPerFile).toBe(10);
    expect(response.body.deletedVersions).toBe(3);
  });

  it('should return 200 with zero deleted versions when no cleanup needed', async () => {
    const { sut, cleanupOldVersionsStub } = makeSut();
    vi.spyOn(cleanupOldVersionsStub, 'execute').mockResolvedValueOnce(0);
    const request: Request<any> = {
      body: {
        projectName: 'clean-project'
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body.deletedVersions).toBe(0);
    expect(response.body.message).toBe("Successfully cleaned up old versions in project 'clean-project'");
  });

  it('should return 500 if CleanupOldVersions throws', async () => {
    const { sut, cleanupOldVersionsStub } = makeSut();
    const error = new Error('Database error');
    vi.spyOn(cleanupOldVersionsStub, 'execute').mockRejectedValueOnce(error);
    const request: Request<any> = {
      body: {
        projectName: 'test-project'
      }
    };    const response = await sut.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(new UnexpectedError(error));
  });

  it('should handle undefined request body', async () => {
    const { sut } = makeSut();
    const request: Request<any> = {};

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('projectName is required');
  });

  it('should handle maxVersionsPerFile as 0', async () => {
    const { sut, cleanupOldVersionsStub } = makeSut();
    const executeSpy = vi.spyOn(cleanupOldVersionsStub, 'execute');
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        maxVersionsPerFile: 0
      }
    };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledWith('test-project', 0);
  });
});
