import { MongoClient, Db, Collection } from 'mongodb';
import { ProjectRepository } from '../../../data/protocols/project-repository.js';
import { Project, ProjectSchema } from '../../../domain/entities/project.js';
import { StorageError, ValidationError } from '../../../presentation/errors/enhanced-errors.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export class MongoProjectRepository implements ProjectRepository {
  private db: Db;
  private collection: Collection<Project>;

  constructor(client: MongoClient, dbName: string) {
    this.db = client.db(dbName);
    this.collection = this.db.collection<Project>('projects');
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await this.collection.createIndex({ name: 1 }, { unique: true });
      await this.collection.createIndex({ updatedAt: -1 });
    } catch (error) {
      console.warn('Failed to create indexes:', error);
    }
  }

  async listProjects(): Promise<Project[]> {
    try {
      const projects = await this.collection
        .find({})
        .sort({ updatedAt: -1 })
        .toArray();
      
      return projects.map(project => ProjectSchema.parse(project));
    } catch (error) {
      throw new StorageError('Failed to list projects', error as Error);
    }
  }

  async projectExists(name: string): Promise<boolean> {
    try {
      const count = await this.collection.countDocuments({ name });
      return count > 0;
    } catch (error) {
      throw new StorageError(`Failed to check if project ${name} exists`, error as Error);
    }
  }
  async ensureProject(name: string): Promise<void> {
    try {
      const exists = await this.projectExists(name);
      
      if (!exists) {
        const now = new Date();
        const project: Project = {
          id: randomUUID(),
          name,
          description: `Memory bank for project ${name}`,
          createdAt: now,
          updatedAt: now,
          fileCount: 0,
          totalSize: 0,
          metadata: {
            tags: [],
            owner: 'system',
            version: '1.0.0',
          },
        };

        const validatedProject = ProjectSchema.parse(project);
        
        await this.collection.insertOne(validatedProject);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.issues);
      }
      throw new StorageError(`Failed to ensure project ${name}`, error as Error);
    }
  }

  async getProject(name: string): Promise<Project | null> {
    try {
      const project = await this.collection.findOne({ name });
      return project ? ProjectSchema.parse(project) : null;
    } catch (error) {
      throw new StorageError(`Failed to get project ${name}`, error as Error);
    }
  }

  async deleteProject(name: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ name });
      return result.deletedCount > 0;
    } catch (error) {
      throw new StorageError(`Failed to delete project ${name}`, error as Error);
    }
  }

  async updateProjectStats(name: string, fileCount: number, totalSize: number): Promise<void> {
    try {
      await this.collection.updateOne(
        { name },
        { 
          $set: { 
            fileCount, 
            totalSize, 
            updatedAt: new Date() 
          } 
        }
      );
    } catch (error) {
      throw new StorageError(`Failed to update stats for project ${name}`, error as Error);
    }
  }
}
