import { MongoClient, Db, Collection } from 'mongodb';
import { FileRepository } from '../../../data/protocols/file-repository.js';
import { ProjectRepository } from '../../../data/protocols/project-repository.js';
import { File, FileSchema } from '../../../domain/entities/file.js';
import { StorageError, ValidationError } from '../../../presentation/errors/enhanced-errors.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

interface MongoFileDocument {
  _id?: any;
  id: string;
  name: string;
  content: string;
  projectName: string;
  createdAt: Date;
  updatedAt: Date;
  size: number;
  checksum?: string;
  metadata: {
    encoding: string;
    mimeType: string;
    tags?: string[];
    wordCount?: number;
    lineCount?: number;
    keywords?: string[];
    summary?: string;
    version?: number;
  };
}

export class MongoFileRepository implements FileRepository {
  private db: Db;
  private collection: Collection<MongoFileDocument>;
  private projectRepository: ProjectRepository;

  constructor(client: MongoClient, dbName: string, projectRepository?: ProjectRepository) {
    this.db = client.db(dbName);
    this.collection = this.db.collection<MongoFileDocument>('memory_files');
    // Pour la compatibilité, on peut optionnellement accepter un ProjectRepository
    // Si non fourni, on crée une instance temporaire (ce qui sera géré par le factory)
    this.projectRepository = projectRepository!;
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await this.collection.createIndexes([
        { key: { projectName: 1, name: 1 }, unique: true },
        { key: { projectName: 1, updatedAt: -1 } },
        { key: { checksum: 1 } },
        { key: { 'metadata.mimeType': 1 } },
        { key: { size: 1 } },
        { key: { 'metadata.tags': 1 } },
        // Index full-text pour recherche dans le contenu
        { 
          key: { 
            content: 'text', 
            name: 'text', 
            'metadata.tags': 'text',
            'metadata.keywords': 'text'
          },
          name: 'content_search_index',
          weights: {
            name: 10,
            'metadata.tags': 5,
            'metadata.keywords': 8,
            content: 1
          }
        }
      ]);
      console.log('✅ MongoDB indexes created successfully');
    } catch (error) {
      console.warn('⚠️ Failed to create MongoDB indexes:', error);
    }
  }

  private enhanceFileMetadata(content: string, fileName: string): MongoFileDocument['metadata'] {
    const lines = content.split('\n');
    const words = content.split(/\s+/).filter(word => word.length > 0);
    
    // Extraction de mots-clés simples (mots de plus de 4 caractères)
    const keywords = [...new Set(
      words
        .filter(word => word.length > 4 && /^[a-zA-Z]+$/.test(word))
        .map(word => word.toLowerCase())
    )].slice(0, 20);

    // Génération d'un résumé simple (premières lignes non vides)
    const summary = lines
      .filter(line => line.trim().length > 0)
      .slice(0, 3)
      .join(' ')
      .substring(0, 200);

    return {
      encoding: 'utf-8',
      mimeType: fileName.endsWith('.md') ? 'text/markdown' : 'text/plain',
      wordCount: words.length,
      lineCount: lines.length,
      keywords,
      summary: summary || undefined,
      version: 1,
    };
  }
  private mongoDocumentToFile(doc: MongoFileDocument): File {
    return FileSchema.parse({
      id: doc.id,
      name: doc.name,
      content: doc.content,
      projectName: doc.projectName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      size: doc.size,
      checksum: doc.checksum,
      metadata: {
        encoding: doc.metadata.encoding,
        mimeType: doc.metadata.mimeType,
        tags: doc.metadata.tags,
        wordCount: doc.metadata.wordCount,
        lineCount: doc.metadata.lineCount,
        keywords: doc.metadata.keywords,
        summary: doc.metadata.summary,
        version: doc.metadata.version,
      }
    });
  }
  async listFiles(projectName: string): Promise<File[]> {
    try {
      const files = await this.collection
        .find({ projectName })
        .sort({ updatedAt: -1 })
        .toArray();
      
      return files.map(file => this.mongoDocumentToFile(file));
    } catch (error) {
      throw new StorageError(`Failed to list files for project ${projectName}`, error as Error);
    }
  }
  async loadFile(projectName: string, fileName: string): Promise<File | null> {
    try {
      const file = await this.collection.findOne({ 
        projectName, 
        name: fileName 
      });
      
      return file ? this.mongoDocumentToFile(file) : null;
    } catch (error) {
      throw new StorageError(`Failed to load file ${fileName} from project ${projectName}`, error as Error);
    }
  }
  async writeFile(
    projectName: string, 
    fileName: string, 
    content: string
  ): Promise<File | null> {
    try {
      const now = new Date();
      const contentBuffer = Buffer.from(content, 'utf8');
      const checksum = createHash('sha256').update(contentBuffer).digest('hex');
      
      const mongoDoc: MongoFileDocument = {
        id: randomUUID(),
        name: fileName,
        content,
        projectName,
        createdAt: now,
        updatedAt: now,
        size: contentBuffer.length,
        checksum,
        metadata: this.enhanceFileMetadata(content, fileName),
      };
        // Validate with Zod before inserting
      const validatedFile = this.mongoDocumentToFile(mongoDoc);
      
      await this.collection.insertOne(mongoDoc);
      
      // Mettre à jour les statistiques du projet
      await this.updateProjectStats(projectName);
      
      return validatedFile;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.issues);
      }
      throw new StorageError(`Failed to write file ${fileName} to project ${projectName}`, error as Error);
    }
  }
  async updateFile(
    projectName: string, 
    fileName: string, 
    content: string
  ): Promise<File | null> {
    try {
      const now = new Date();
      const contentBuffer = Buffer.from(content, 'utf8');
      const checksum = createHash('sha256').update(contentBuffer).digest('hex');
      
      const updateData = {
        content,
        updatedAt: now,
        size: contentBuffer.length,
        checksum,
        metadata: this.enhanceFileMetadata(content, fileName),
      };
        const result = await this.collection.findOneAndUpdate(
        { projectName, name: fileName },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (result) {
        // Mettre à jour les statistiques du projet
        await this.updateProjectStats(projectName);
      }

      return result ? this.mongoDocumentToFile(result) : null;
    } catch (error) {
      throw new StorageError(`Failed to update file ${fileName} in project ${projectName}`, error as Error);
    }
  }
  async deleteFile(projectName: string, fileName: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ 
        projectName, 
        name: fileName 
      });
      
      const deleted = result.deletedCount > 0;
      
      if (deleted) {
        // Mettre à jour les statistiques du projet
        await this.updateProjectStats(projectName);
      }
      
      return deleted;
    } catch (error) {
      throw new StorageError(`Failed to delete file ${fileName} from project ${projectName}`, error as Error);
    }
  }

  async searchFiles(projectName: string, query: string): Promise<File[]> {
    try {
      const searchResults = await this.collection
        .find({
          projectName,
          $text: { $search: query }
        })
        .sort({ score: { $meta: 'textScore' } })
        .limit(50)
        .toArray();
      
      return searchResults.map(file => this.mongoDocumentToFile(file));
    } catch (error) {
      throw new StorageError(`Failed to search files in project ${projectName}`, error as Error);
    }
  }

  async getFilesByTags(projectName: string, tags: string[]): Promise<File[]> {
    try {
      const files = await this.collection
        .find({
          projectName,
          'metadata.tags': { $in: tags }
        })
        .sort({ updatedAt: -1 })
        .toArray();
      
      return files.map(file => this.mongoDocumentToFile(file));
    } catch (error) {
      throw new StorageError(`Failed to get files by tags in project ${projectName}`, error as Error);
    }
  }

  async getProjectStats(projectName: string): Promise<{ fileCount: number; totalSize: number }> {
    try {
      const stats = await this.collection.aggregate([
        { $match: { projectName } },
        {
          $group: {
            _id: null,
            fileCount: { $sum: 1 },
            totalSize: { $sum: '$size' }
          }
        }
      ]).toArray();
      
      return stats.length > 0 
        ? { fileCount: stats[0].fileCount, totalSize: stats[0].totalSize }
        : { fileCount: 0, totalSize: 0 };
    } catch (error) {
      throw new StorageError(`Failed to get project stats for ${projectName}`, error as Error);
    }
  }
  // Méthode pour mettre à jour les statistiques d'un projet
  private async updateProjectStats(projectName: string): Promise<void> {
    try {
      const stats = await this.getProjectStats(projectName);
      
      if (this.projectRepository) {
        await this.projectRepository.updateProjectStats(projectName, stats.fileCount, stats.totalSize);
      }
    } catch (error) {
      console.warn(`Failed to update project stats for ${projectName}:`, error);
      // Ne pas faire échouer l'opération principale si la mise à jour des stats échoue
    }
  }
}
