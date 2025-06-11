import { describe, it, expect, vi } from 'vitest';
import { RevertFileToVersionController } from '../../../../src/presentation/controllers/revert-file-to-version/revert-file-to-version-controller.js';
import { RevertFileToVersion } from '../../../../src/domain/usecases/file-versioning.js';
import { Request } from '../../../../src/presentation/protocols/index.js';
import { UnexpectedError, NotFoundError } from '../../../../src/presentation/errors/index.js';

const makeRevertFileToVersionStub = (): RevertFileToVersion => {
  class RevertFileToVersionStub implements RevertFileToVersion {
    async execute(projectName: string, fileName: string, version: number): Promise<boolean> {
      return true;
    }
  }
  return new RevertFileToVersionStub();
};

interface SutTypes {
  sut: RevertFileToVersionController;
  revertFileToVersionStub: RevertFileToVersion;
}

const makeSut = (): SutTypes => {
  const revertFileToVersionStub = makeRevertFileToVersionStub();
  const sut = new RevertFileToVersionController(revertFileToVersionStub);
  return {
    sut,
    revertFileToVersionStub
  };
};

describe('RevertFileToVersionController', () => {
  it('should return 400 if no projectName is provided', async () => {
    const { sut } = makeSut();
    const request: Request<any> = {
      body: {
        fileName: 'test.md',
        version: 1
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('projectName is required');
  });

  it('should return 400 if no fileName is provided', async () => {
    const { sut } = makeSut();
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        version: 1
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('fileName is required');
  });

  it('should return 400 if no version is provided', async () => {
    const { sut } = makeSut();
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        fileName: 'test.md'
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('version is required');
  });

  it('should return 400 if version is not a positive integer', async () => {
    const { sut } = makeSut();
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        fileName: 'test.md',
        version: 0
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Version must be a positive integer');
  });

  it('should return 400 if version is not an integer', async () => {
    const { sut } = makeSut();
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        fileName: 'test.md',
        version: 1.5
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Version must be a positive integer');
  });

  it('should call RevertFileToVersion with correct parameters', async () => {
    const { sut, revertFileToVersionStub } = makeSut();
    const executeSpy = vi.spyOn(revertFileToVersionStub, 'execute');
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        fileName: 'test.md',
        version: 2
      }
    };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledWith('test-project', 'test.md', 2);
  });

  it('should return 404 if revert operation fails', async () => {
    const { sut, revertFileToVersionStub } = makeSut();
    vi.spyOn(revertFileToVersionStub, 'execute').mockResolvedValueOnce(false);
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        fileName: 'test.md',
        version: 999
      }
    };

    const response = await sut.handle(request);    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(new NotFoundError('Cannot revert: Version 999 not found for file test.md in project test-project'));
  });

  it('should return 200 with success message when revert is successful', async () => {
    const { sut, revertFileToVersionStub } = makeSut();
    vi.spyOn(revertFileToVersionStub, 'execute').mockResolvedValueOnce(true);
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        fileName: 'test.md',
        version: 3
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Successfully reverted test.md to version 3');
    expect(response.body.data).toEqual({
      projectName: 'test-project',
      fileName: 'test.md',
      revertedToVersion: 3,
      timestamp: expect.any(String)
    });
    expect(response.body.workflow).toBeDefined();
    expect(response.body.workflow.next_steps).toHaveLength(3);
    expect(response.body.warnings).toHaveLength(3);
  });

  it('should return 500 if RevertFileToVersion throws', async () => {
    const { sut, revertFileToVersionStub } = makeSut();
    const error = new Error('Database error');
    vi.spyOn(revertFileToVersionStub, 'execute').mockRejectedValueOnce(error);
    const request: Request<any> = {
      body: {
        projectName: 'test-project',
        fileName: 'test.md',
        version: 1
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
});
