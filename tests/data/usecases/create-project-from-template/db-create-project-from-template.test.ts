import { describe, it, expect, vi } from 'vitest';
import { DbCreateProjectFromTemplate } from '../../../../src/data/usecases/create-project-from-template/db-create-project-from-template.js';
import { ProjectTemplateRepository } from '../../../../src/data/protocols/project-template-repository.js';
import { ProjectRepository } from '../../../../src/data/protocols/project-repository.js';
import { FileRepository } from '../../../../src/data/protocols/file-repository.js';
import { ProjectTemplate, CreateFromTemplateInput } from '../../../../src/domain/entities/project-template.js';
import { Project } from '../../../../src/domain/entities/project.js';
import { File } from '../../../../src/domain/entities/file.js';

const makeProjectTemplateRepositoryStub = (): ProjectTemplateRepository => {
  class ProjectTemplateRepositoryStub implements ProjectTemplateRepository {
    async create(template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTemplate> {
      return Promise.resolve({
        id: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...template
      });
    }

    async getAll(): Promise<ProjectTemplate[]> {
      return Promise.resolve([]);
    }

    async getById(id: string): Promise<ProjectTemplate | null> {
      return Promise.resolve({
        id,
        name: 'Test Template',
        description: 'A test template',
        category: 'testing',
        version: '1.0.0',
        tags: ['test'],
        variables: [
          {
            name: 'PROJECT_NAME',
            description: 'Name of the project',
            defaultValue: 'MyProject',
            required: true,
            type: 'string'
          }
        ],
        files: [
          {
            path: 'README.md',
            content: '# {{PROJECT_NAME}}\n\nCreated on {{DATE}}',
            isVariable: true
          },
          {
            path: 'src/main.js',
            content: 'console.log("Hello from {{PROJECT_NAME}}!");',
            isVariable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    async getByName(name: string): Promise<ProjectTemplate | null> {
      return Promise.resolve(null);
    }

    async update(templateId: string, updates: Partial<Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProjectTemplate | null> {
      return Promise.resolve(null);
    }

    async delete(templateId: string): Promise<boolean> {
      return Promise.resolve(true);
    }

    async exists(templateId: string): Promise<boolean> {
      return Promise.resolve(true);
    }    async getByCategory(): Promise<ProjectTemplate[]> {
      return Promise.resolve([]);
    }    async getByTags(tags: string[]): Promise<ProjectTemplate[]> {
      return Promise.resolve([]);
    }

    async installPredefined(): Promise<{ installed: ProjectTemplate[]; errors: Array<{ templateName: string; error: string; }>; }> {
      return Promise.resolve({ installed: [], errors: [] });
    }
  }
  return new ProjectTemplateRepositoryStub();
};

const makeProjectRepositoryStub = (): ProjectRepository => {
  class ProjectRepositoryStub implements ProjectRepository {
    async ensureProject(name: string): Promise<void> {
      return Promise.resolve();
    }

    async listProjects(): Promise<Project[]> {
      return Promise.resolve([]);
    }

    async projectExists(name: string): Promise<boolean> {
      return Promise.resolve(false);
    }

    async updateProjectStats(name: string, fileCount: number, totalSize: number): Promise<void> {
      return Promise.resolve();
    }

    async deleteProject(name: string): Promise<boolean> {
      return Promise.resolve(true);
    }

    // Additional method for testing - this method is called by the implementation but not in the interface
    async getProject(name: string): Promise<Project | null> {
      return Promise.resolve({
        id: 'project-id',
        name,
        description: `Project created from template`,
        createdAt: new Date(),
        updatedAt: new Date(),
        fileCount: 2,
        totalSize: 1000,
      });
    }
  }
  return new ProjectRepositoryStub();
};

const makeFileRepositoryStub = (): FileRepository => {
  class FileRepositoryStub implements FileRepository {
    async writeFile(projectName: string, fileName: string, content: string): Promise<File | null> {
      return Promise.resolve({
        id: 'file-id',
        name: fileName,
        projectName,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        size: content.length,
        checksum: 'abc123'
      });
    }

    async loadFile(projectName: string, fileName: string): Promise<File | null> {
      return Promise.resolve(null);
    }

    async updateFile(projectName: string, fileName: string, content: string): Promise<File | null> {
      return Promise.resolve(null);
    }

    async deleteFile(projectName: string, fileName: string): Promise<boolean> {
      return Promise.resolve(true);
    }

    async listFiles(projectName: string): Promise<File[]> {
      return Promise.resolve([]);
    }

    async searchFiles(projectName: string, query: string): Promise<File[]> {
      return Promise.resolve([]);
    }

    async getFilesByTags(projectName: string, tags: string[]): Promise<File[]> {
      return Promise.resolve([]);
    }

    async getProjectStats(projectName: string): Promise<{ fileCount: number; totalSize: number }> {
      return Promise.resolve({ fileCount: 0, totalSize: 0 });
    }
  }
  return new FileRepositoryStub();
};

interface SutTypes {
  sut: DbCreateProjectFromTemplate;
  projectTemplateRepositoryStub: ProjectTemplateRepository;
  projectRepositoryStub: ProjectRepository;
  fileRepositoryStub: FileRepository;
}

const makeSut = (): SutTypes => {
  const projectTemplateRepositoryStub = makeProjectTemplateRepositoryStub();
  const projectRepositoryStub = makeProjectRepositoryStub();
  const fileRepositoryStub = makeFileRepositoryStub();
  const sut = new DbCreateProjectFromTemplate(
    projectTemplateRepositoryStub,
    projectRepositoryStub,
    fileRepositoryStub
  );
  return {
    sut,
    projectTemplateRepositoryStub,
    projectRepositoryStub,
    fileRepositoryStub
  };
};

describe('DbCreateProjectFromTemplate', () => {
  it('should call ProjectTemplateRepository getById with correct template id', async () => {
    const { sut, projectTemplateRepositoryStub } = makeSut();
    const getByIdSpy = vi.spyOn(projectTemplateRepositoryStub, 'getById');
    
    const input: CreateFromTemplateInput = {
      templateId: 'template-123',
      projectName: 'my-new-project',
      variables: {}
    };

    await sut.execute(input);

    expect(getByIdSpy).toHaveBeenCalledWith('template-123');
  });

  it('should throw error when template is not found', async () => {
    const { sut, projectTemplateRepositoryStub } = makeSut();
    vi.spyOn(projectTemplateRepositoryStub, 'getById').mockResolvedValueOnce(null);
    
    const input: CreateFromTemplateInput = {
      templateId: 'non-existent-template',
      projectName: 'my-new-project',
      variables: {}
    };

    await expect(sut.execute(input)).rejects.toThrow('Template with ID non-existent-template not found');
  });

  it('should call ProjectRepository ensureProject with correct project name', async () => {
    const { sut, projectRepositoryStub } = makeSut();
    const ensureProjectSpy = vi.spyOn(projectRepositoryStub, 'ensureProject');
    
    const input: CreateFromTemplateInput = {
      templateId: 'template-123',
      projectName: 'my-new-project',
      variables: {}
    };

    await sut.execute(input);

    expect(ensureProjectSpy).toHaveBeenCalledWith('my-new-project');
  });

  it('should create files from template with variable replacement', async () => {
    const { sut, fileRepositoryStub } = makeSut();
    const writeFileSpy = vi.spyOn(fileRepositoryStub, 'writeFile');
    
    const input: CreateFromTemplateInput = {
      templateId: 'template-123',
      projectName: 'my-awesome-project',
      variables: {
        PROJECT_NAME: 'MyAwesomeProject'
      }
    };

    const result = await sut.execute(input);

    expect(writeFileSpy).toHaveBeenCalledTimes(2);
    
    // Check README.md creation
    expect(writeFileSpy).toHaveBeenCalledWith(
      'my-awesome-project',
      'README.md',
      expect.stringContaining('# MyAwesomeProject')
    );
    
    // Check main.js creation
    expect(writeFileSpy).toHaveBeenCalledWith(
      'my-awesome-project',
      'src/main.js',
      'console.log("Hello from MyAwesomeProject!");'
    );

    expect(result.filesCreated).toHaveLength(2);
    expect(result.filesCreated[0].success).toBe(true);
    expect(result.filesCreated[1].success).toBe(true);
  });

  it('should use default values for missing variables', async () => {
    const { sut, fileRepositoryStub } = makeSut();
    const writeFileSpy = vi.spyOn(fileRepositoryStub, 'writeFile');
    
    const input: CreateFromTemplateInput = {
      templateId: 'template-123',
      projectName: 'my-new-project',
      variables: {} // No variables provided
    };

    await sut.execute(input);

    // Should use default value 'MyProject' for PROJECT_NAME
    expect(writeFileSpy).toHaveBeenCalledWith(
      'my-new-project',
      'README.md',
      expect.stringContaining('# MyProject')
    );
  });

  it('should replace common template variables like DATE', async () => {
    const { sut, fileRepositoryStub } = makeSut();
    const writeFileSpy = vi.spyOn(fileRepositoryStub, 'writeFile');
    
    const input: CreateFromTemplateInput = {
      templateId: 'template-123',
      projectName: 'my-new-project',
      variables: {
        PROJECT_NAME: 'TestProject'
      }
    };

    await sut.execute(input);

    const todayDate = new Date().toISOString().split('T')[0];
    expect(writeFileSpy).toHaveBeenCalledWith(
      'my-new-project',
      'README.md',
      expect.stringContaining(todayDate)
    );
  });
  it('should handle file creation failures gracefully', async () => {
    const { sut, fileRepositoryStub } = makeSut();
    vi.spyOn(fileRepositoryStub, 'writeFile').mockImplementation(async (projectName, fileName, content) => {
      if (fileName === 'src/main.js') {
        return null; // Simulate failure
      }
      return {
        id: 'file-id',
        name: fileName,
        projectName,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        size: content.length,
        checksum: 'abc123'
      };
    });
    
    const input: CreateFromTemplateInput = {
      templateId: 'template-123',
      projectName: 'my-new-project',
      variables: {}
    };

    const result = await sut.execute(input);

    expect(result.filesCreated).toHaveLength(2);
    expect(result.filesCreated[0].success).toBe(true);
    expect(result.filesCreated[1].success).toBe(false);
    expect(result.filesCreated[1].error).toBe('Failed to create file');
  });
  it('should handle exceptions during file creation', async () => {
    const { sut, fileRepositoryStub } = makeSut();
    vi.spyOn(fileRepositoryStub, 'writeFile').mockImplementation(async (projectName, fileName, content) => {
      if (fileName === 'src/main.js') {
        throw new Error('Disk full');
      }
      return {
        id: 'file-id',
        name: fileName,
        projectName,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        size: content.length,
        checksum: 'abc123'
      };
    });
    
    const input: CreateFromTemplateInput = {
      templateId: 'template-123',
      projectName: 'my-new-project',
      variables: {}
    };

    const result = await sut.execute(input);

    expect(result.filesCreated[1].success).toBe(false);
    expect(result.filesCreated[1].error).toBe('Disk full');
  });
  it('should return project and files created information', async () => {
    const { sut } = makeSut();
    
    const input: CreateFromTemplateInput = {
      templateId: 'template-123',
      projectName: 'my-new-project',
      variables: {
        PROJECT_NAME: 'MyProject'
      }
    };

    const result = await sut.execute(input);

    expect(result.project).toBeDefined();
    expect(result.project.name).toBe('my-new-project');
    expect(result.filesCreated).toHaveLength(2);
    expect(result.filesCreated.every(f => f.success)).toBe(true);
  });
});
