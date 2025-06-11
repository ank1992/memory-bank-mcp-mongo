import { describe, it, expect, vi } from 'vitest';
import { InstallPredefinedTemplatesController } from '../../../../src/presentation/controllers/install-predefined-templates/install-predefined-templates-controller.js';
import { InstallPredefinedTemplates } from '../../../../src/domain/usecases/project-templates.js';
import { ProjectTemplate } from '../../../../src/domain/entities/project-template.js';
import { Request } from '../../../../src/presentation/protocols/index.js';
import { UnexpectedError } from '../../../../src/presentation/errors/index.js';

const makeInstallPredefinedTemplatesStub = (): InstallPredefinedTemplates => {
  class InstallPredefinedTemplatesStub implements InstallPredefinedTemplates {
    async execute(): Promise<{
      installed: ProjectTemplate[];
      errors: Array<{
        templateName: string;
        error: string;
      }>;
    }> {
      return {
        installed: [
          {
            id: 'template-1',
            name: 'Basic Project',
            description: 'A basic project template',
            category: 'general',
            version: '1.0.0',
            tags: ['basic', 'starter'],
            files: [
              {
                path: 'README.md',
                content: '# {{projectName}}\n\nA basic project.',
                isVariable: true,
                description: 'Project readme file'
              }
            ],
            variables: [
              {
                name: 'projectName',
                description: 'Name of the project',
                required: true,
                type: 'string'
              }
            ],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          {
            id: 'template-2',
            name: 'TypeScript Project',
            description: 'A TypeScript project template',
            category: 'development',
            version: '1.0.0',
            tags: ['typescript', 'development'],
            files: [
              {
                path: 'package.json',
                content: '{\n  "name": "{{projectName}}",\n  "version": "1.0.0"\n}',
                isVariable: true
              }
            ],
            variables: [
              {
                name: 'projectName',
                description: 'Name of the project',
                required: true,
                type: 'string'
              }
            ],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ],
        errors: []
      };
    }
  }
  return new InstallPredefinedTemplatesStub();
};

interface SutTypes {
  sut: InstallPredefinedTemplatesController;
  installPredefinedTemplatesStub: InstallPredefinedTemplates;
}

const makeSut = (): SutTypes => {
  const installPredefinedTemplatesStub = makeInstallPredefinedTemplatesStub();
  const sut = new InstallPredefinedTemplatesController(installPredefinedTemplatesStub);
  return {
    sut,
    installPredefinedTemplatesStub
  };
};

describe('InstallPredefinedTemplatesController', () => {
  it('should call InstallPredefinedTemplates execute method', async () => {
    const { sut, installPredefinedTemplatesStub } = makeSut();
    const executeSpy = vi.spyOn(installPredefinedTemplatesStub, 'execute');
    const request: Request<any> = { body: {} };

    await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledOnce();
  });
  it('should return 200 with installed templates when successful', async () => {
    const { sut, installPredefinedTemplatesStub } = makeSut();
    const mockResult = {
      installed: [
        {
          id: 'template-1',
          name: 'Basic Project',
          description: 'A basic project template',
          category: 'general',
          version: '1.0.0',
          tags: ['basic'],
          files: [{
            path: 'README.md',
            content: '# {{projectName}}',
            isVariable: true
          }],
          variables: [{
            name: 'projectName',
            description: 'Project name',
            required: true,
            type: 'string' as const
          }],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'template-2',
          name: 'React App',
          description: 'A React application template',
          category: 'frontend',
          version: '1.0.0',
          tags: ['react', 'frontend'],
          files: [{
            path: 'package.json',
            content: '{"name": "{{projectName}}"}',
            isVariable: true
          }],
          variables: [{
            name: 'projectName',
            description: 'Project name',
            required: true,
            type: 'string' as const
          }],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ],
      errors: []
    };
    vi.spyOn(installPredefinedTemplatesStub, 'execute').mockResolvedValueOnce(mockResult);
    const request: Request<any> = { body: {} };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body?.message).toBe('Installed 2 predefined templates');
    expect(response.body?.data.installed).toHaveLength(2);
    expect(response.body?.data.installed[0]).toEqual(expect.objectContaining({
      id: 'template-1',
      name: 'Basic Project',
      description: 'A basic project template',
      category: 'general'
    }));
    expect(response.body?.data.errors).toEqual([]);
  });
  it('should return 200 with no templates when none are installed', async () => {
    const { sut, installPredefinedTemplatesStub } = makeSut();
    const mockResult = {
      installed: [],
      errors: []
    };
    vi.spyOn(installPredefinedTemplatesStub, 'execute').mockResolvedValueOnce(mockResult);
    const request: Request<any> = { body: {} };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body?.message).toBe('Installed 0 predefined templates');
    expect(response.body?.data.installed).toHaveLength(0);
    expect(response.body?.data.errors).toEqual([]);
  });
  it('should return 200 with errors when some templates fail to install', async () => {
    const { sut, installPredefinedTemplatesStub } = makeSut();
    const mockResult = {
      installed: [
        {
          id: 'template-1',
          name: 'Basic Project',
          description: 'A basic project template',
          category: 'general',
          version: '1.0.0',
          tags: ['basic'],
          files: [{
            path: 'README.md',
            content: '# {{projectName}}',
            isVariable: true
          }],
          variables: [{
            name: 'projectName',
            description: 'Project name',
            required: true,
            type: 'string' as const
          }],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ],
      errors: [
        {
          templateName: 'Failed Template',
          error: 'Template already exists'
        },
        {
          templateName: 'Another Failed Template',
          error: 'Invalid template format'
        }
      ]
    };
    vi.spyOn(installPredefinedTemplatesStub, 'execute').mockResolvedValueOnce(mockResult);
    const request: Request<any> = { body: {} };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body?.message).toBe('Installed 1 predefined templates');
    expect(response.body?.data.installed).toHaveLength(1);
    expect(response.body?.data.errors).toHaveLength(2);
    expect(response.body?.data.errors[0]).toEqual({
      templateName: 'Failed Template',
      error: 'Template already exists'
    });
  });

  it('should return 500 if InstallPredefinedTemplates throws', async () => {
    const { sut, installPredefinedTemplatesStub } = makeSut();
    const error = new Error('Database connection failed');
    vi.spyOn(installPredefinedTemplatesStub, 'execute').mockRejectedValueOnce(error);
    const request: Request<any> = { body: {} };    const response = await sut.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(new UnexpectedError(error));
  });

  it('should handle request without body', async () => {
    const { sut, installPredefinedTemplatesStub } = makeSut();
    const executeSpy = vi.spyOn(installPredefinedTemplatesStub, 'execute');
    const request: Request<any> = {};

    const response = await sut.handle(request);

    expect(executeSpy).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });
  it('should map template data correctly in response', async () => {
    const { sut, installPredefinedTemplatesStub } = makeSut();
    const mockResult = {
      installed: [
        {
          id: 'complex-template',
          name: 'Complex Template',
          description: 'A complex project template with many features',
          category: 'advanced',
          version: '2.0.0',
          tags: ['complex', 'advanced'],
          files: [
            {
              path: 'package.json',
              content: '{"name": "{{projectName}}"}',
              isVariable: true,
              description: 'Package configuration'
            },
            {
              path: 'src/index.ts',
              content: 'console.log("Hello {{projectName}}");',
              isVariable: true
            }
          ],
          variables: [
            {
              name: 'projectName',
              description: 'Project name',
              required: true,
              type: 'string' as const
            }
          ],
          author: 'Template Author',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ],
      errors: []
    };
    vi.spyOn(installPredefinedTemplatesStub, 'execute').mockResolvedValueOnce(mockResult);
    const request: Request<any> = { body: {} };

    const response = await sut.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body?.data.installed[0]).toEqual(expect.objectContaining({
      id: 'complex-template',
      name: 'Complex Template',
      description: 'A complex project template with many features',
      category: 'advanced'
    }));
  });
});
