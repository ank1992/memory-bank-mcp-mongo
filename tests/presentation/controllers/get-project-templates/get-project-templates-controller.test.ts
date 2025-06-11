import { describe, it, expect, vi } from 'vitest';
import { GetProjectTemplatesController } from '../../../../src/presentation/controllers/get-project-templates/get-project-templates-controller.js';
import { GetProjectTemplates } from '../../../../src/domain/usecases/project-templates.js';
import { Request } from '../../../../src/presentation/protocols/index.js';

const makeGetProjectTemplatesStub = (): GetProjectTemplates => {
  class GetProjectTemplatesStub implements GetProjectTemplates {
    async execute(category?: string, tags?: string[]): Promise<Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      version: string;
      author?: string;
      tags: string[];
      variables: Array<{
        name: string;
        description: string;
        defaultValue?: string;
        required: boolean;
        type: 'string' | 'number' | 'boolean' | 'date';
      }>;
      files: Array<{
        path: string;
        content: string;
        isVariable: boolean;
        description?: string;
      }>;
      createdAt: Date;
      updatedAt: Date;
    }>> {
      return [
        {
          id: 'template-1',
          name: 'Simple Note Project',
          description: 'A simple note-taking project template',
          category: 'Documentation',
          version: '1.0.0',
          author: 'Memory Bank',
          tags: ['notes', 'simple'],
          variables: [
            {
              name: 'PROJECT_NAME',
              description: 'Name of the project',
              defaultValue: 'My Notes',
              required: true,
              type: 'string'
            }
          ],          files: [
            {
              path: 'README.md',
              content: '# {{PROJECT_NAME}}\n\nA simple note-taking project.',
              isVariable: true
            }
          ],
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          id: 'template-2',
          name: 'Development Project',
          description: 'A development project template',
          category: 'Development',
          version: '1.0.0',
          author: 'Memory Bank',
          tags: ['development', 'code'],
          variables: [],          files: [
            {
              path: 'src/main.js',
              content: 'console.log("Hello World!");',
              isVariable: false
            }
          ],
          createdAt: new Date('2024-01-02T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z')
        }
      ];
    }
  }
  return new GetProjectTemplatesStub();
};

interface SutTypes {
  sut: GetProjectTemplatesController;
  getProjectTemplatesStub: GetProjectTemplates;
}

const makeSut = (): SutTypes => {
  const getProjectTemplatesStub = makeGetProjectTemplatesStub();
  const sut = new GetProjectTemplatesController(getProjectTemplatesStub);
  return {
    sut,
    getProjectTemplatesStub
  };
};

describe('GetProjectTemplatesController', () => {
  it('should call GetProjectTemplates with no filters when none provided', async () => {
    const { sut, getProjectTemplatesStub } = makeSut();
    const executeSpy = vi.spyOn(getProjectTemplatesStub, 'execute');
    const request: Request<any> = {
      body: {}
    };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should call GetProjectTemplates with category filter', async () => {
    const { sut, getProjectTemplatesStub } = makeSut();
    const executeSpy = vi.spyOn(getProjectTemplatesStub, 'execute');
    const request: Request<any> = {
      body: {
        category: 'Documentation'
      }
    };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledWith('Documentation', undefined);
  });

  it('should call GetProjectTemplates with tags filter', async () => {
    const { sut, getProjectTemplatesStub } = makeSut();
    const executeSpy = vi.spyOn(getProjectTemplatesStub, 'execute');
    const request: Request<any> = {
      body: {
        tags: ['notes', 'simple']
      }
    };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledWith(undefined, ['notes', 'simple']);
  });

  it('should call GetProjectTemplates with both category and tags filters', async () => {
    const { sut, getProjectTemplatesStub } = makeSut();
    const executeSpy = vi.spyOn(getProjectTemplatesStub, 'execute');
    const request: Request<any> = {
      body: {
        category: 'Documentation',
        tags: ['notes']
      }
    };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledWith('Documentation', ['notes']);
  });

  it('should return ok with empty array if no templates found', async () => {
    const { sut, getProjectTemplatesStub } = makeSut();
    vi.spyOn(getProjectTemplatesStub, 'execute').mockResolvedValueOnce([]);
    const request: Request<any> = {
      body: {}
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Found 0 project templates');
    expect(response.body.data.templates).toEqual([]);
    expect(response.body.data.totalTemplates).toBe(0);
  });

  it('should return ok with templates data on success', async () => {
    const { sut } = makeSut();
    const request: Request<any> = {
      body: {}
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Found 2 project templates');
    expect(response.body.data.totalTemplates).toBe(2);
    expect(response.body.data.templates).toHaveLength(2);
    expect(response.body.data.templates[0]).toEqual({
      id: 'template-1',
      name: 'Simple Note Project',
      description: 'A simple note-taking project template',
      category: 'Documentation',
      version: '1.0.0',
      author: 'Memory Bank',
      tags: ['notes', 'simple'],
      variableCount: 1,
      fileCount: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    });
  });

  it('should return templates filtered by category', async () => {
    const { sut, getProjectTemplatesStub } = makeSut();
    vi.spyOn(getProjectTemplatesStub, 'execute').mockResolvedValueOnce([
      {
        id: 'template-1',
        name: 'Documentation Template',
        description: 'A documentation template',
        category: 'Documentation',
        version: '1.0.0',
        author: 'Memory Bank',
        tags: ['docs'],
        variables: [],
        files: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
    ]);
    const request: Request<any> = {
      body: {
        category: 'Documentation'
      }
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.templates).toHaveLength(1);
    expect(response.body.data.templates[0].category).toBe('Documentation');
  });

  it('should return serverError if GetProjectTemplates throws', async () => {
    const { sut, getProjectTemplatesStub } = makeSut();
    const error = new Error('Database error');
    vi.spyOn(getProjectTemplatesStub, 'execute').mockRejectedValueOnce(error);
    const request: Request<any> = {
      body: {}
    };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toContain('error');
  });
});
