import { FileRepository } from "../../../src/data/protocols/file-repository.js";
import { File } from "../../../src/domain/entities/file.js";
import { randomUUID } from 'crypto';

export class MockFileRepository implements FileRepository {
  private projectFiles: Record<string, Record<string, File>> = {
    "project-1": {
      "file1.md": {
        id: randomUUID(),
        name: "file1.md",
        content: "Content of file1.md",
        projectName: "project-1",
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        size: "Content of file1.md".length,
        checksum: "abc123",
        metadata: {
          encoding: 'utf-8',
          mimeType: 'text/markdown',
          tags: ['mock', 'test']
        }
      },
      "file2.md": {
        id: randomUUID(),
        name: "file2.md",
        content: "Content of file2.md",
        projectName: "project-1",
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        size: "Content of file2.md".length,
        checksum: "def456",
        metadata: {
          encoding: 'utf-8',
          mimeType: 'text/markdown'
        }
      },
    },
    "project-2": {
      "fileA.md": {
        id: randomUUID(),
        name: "fileA.md",
        content: "Content of fileA.md",
        projectName: "project-2",
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        size: "Content of fileA.md".length,
        checksum: "ghi789",
        metadata: {
          encoding: 'utf-8',
          mimeType: 'text/markdown'
        }
      },
      "fileB.md": {
        id: randomUUID(),
        name: "fileB.md",
        content: "Content of fileB.md",
        projectName: "project-2",
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
        size: "Content of fileB.md".length,
        checksum: "jkl012",
        metadata: {
          encoding: 'utf-8',
          mimeType: 'text/markdown'
        }
      },
    },
  };

  async listFiles(projectName: string): Promise<File[]> {
    const project = this.projectFiles[projectName];
    return project ? Object.values(project) : [];
  }

  async loadFile(
    projectName: string,
    fileName: string
  ): Promise<File | null> {
    if (
      this.projectFiles[projectName] &&
      this.projectFiles[projectName][fileName]
    ) {
      return this.projectFiles[projectName][fileName];
    }
    return null;
  }

  async writeFile(
    projectName: string,
    fileName: string,
    content: string
  ): Promise<File | null> {
    if (!this.projectFiles[projectName]) {
      this.projectFiles[projectName] = {};
    }
    
    const file: File = {
      id: randomUUID(),
      name: fileName,
      content,
      projectName,
      createdAt: new Date(),
      updatedAt: new Date(),
      size: content.length,
      checksum: `mock-${Date.now()}`,
      metadata: {
        encoding: 'utf-8',
        mimeType: fileName.endsWith('.md') ? 'text/markdown' : 'text/plain'
      }
    };
    
    this.projectFiles[projectName][fileName] = file;
    return file;
  }

  async updateFile(
    projectName: string,
    fileName: string,
    content: string
  ): Promise<File | null> {
    if (
      this.projectFiles[projectName] &&
      this.projectFiles[projectName][fileName]
    ) {
      const existingFile = this.projectFiles[projectName][fileName];
      const updatedFile: File = {
        ...existingFile,
        content,
        updatedAt: new Date(),
        size: content.length,
        checksum: `mock-${Date.now()}`
      };
      this.projectFiles[projectName][fileName] = updatedFile;
      return updatedFile;
    }
    return null;
  }
  async deleteFile(projectName: string, fileName: string): Promise<boolean> {
    if (
      this.projectFiles[projectName] &&
      this.projectFiles[projectName][fileName]
    ) {
      delete this.projectFiles[projectName][fileName];
      return true;
    }
    return false;
  }

  async searchFiles(projectName: string, query: string): Promise<File[]> {
    const files = this.projectFiles[projectName];
    if (!files) return [];

    return Object.values(files).filter(file => 
      file.content.toLowerCase().includes(query.toLowerCase()) ||
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getFilesByTags(projectName: string, tags: string[]): Promise<File[]> {
    const files = this.projectFiles[projectName];
    if (!files) return [];

    return Object.values(files).filter(file => 
      file.metadata?.tags && tags.some(tag => file.metadata?.tags?.includes(tag))
    );
  }

  async getProjectStats(projectName: string): Promise<{ fileCount: number; totalSize: number }> {
    const files = this.projectFiles[projectName];
    if (!files) return { fileCount: 0, totalSize: 0 };

    const fileArray = Object.values(files);
    return {
      fileCount: fileArray.length,
      totalSize: fileArray.reduce((total, file) => total + file.size, 0)
    };
  }
}
