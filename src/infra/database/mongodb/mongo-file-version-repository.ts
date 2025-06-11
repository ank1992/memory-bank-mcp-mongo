import { MongoClient, Db, Collection } from "mongodb";
import { FileVersionRepository } from "../../../data/protocols/file-version-repository.js";
import { FileVersion, FileVersionSchema, VersioningConfig } from "../../../domain/entities/file-version.js";
import { StorageError, ValidationError } from "../../../presentation/errors/enhanced-errors.js";
import { z } from "zod";
import { randomUUID } from "crypto";

interface MongoFileVersionDocument {
  _id?: any;
  id: string;
  fileId: string;
  projectName: string;
  fileName: string;
  content: string;
  version: number;
  checksum: string;
  size: number;
  createdAt: Date;
  metadata?: {
    encoding: string;
    mimeType: string;
    tags?: string[];
    wordCount?: number;
    lineCount?: number;
    keywords?: string[];
    summary?: string;
    changeDescription?: string;
    isAutoSave?: boolean;
  };
}

export class MongoFileVersionRepository implements FileVersionRepository {
  private db: Db;
  private collection: Collection<MongoFileVersionDocument>;

  constructor(client: MongoClient, dbName: string) {
    this.db = client.db(dbName);
    this.collection = this.db.collection<MongoFileVersionDocument>("file_versions");
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      const createIndexSafely = async (keys: any, options: any) => {
        try {
          await this.collection.createIndex(keys, options);
          console.log(`✅ Created file version index: ${options.name || "unnamed"}`);
        } catch (error: any) {
          if (error.code === 86 || error.codeName === "IndexKeySpecsConflict") {
            try {
              const indexName = options.name || Object.keys(keys).join("_");
              console.warn(`⚠️ Index conflict for ${indexName}, attempting to recreate...`);
              await this.collection.dropIndex(indexName);
              await this.collection.createIndex(keys, options);
              console.log(`✅ Successfully recreated index: ${indexName}`);
            } catch (recreateError) {
              console.warn(`⚠️ Could not recreate index:`, recreateError);
            }
          } else {
            console.warn(`⚠️ Failed to create index:`, error.message);
          }
        }
      };

      await createIndexSafely(
        { fileId: 1, version: 1 },
        { unique: true, name: "file_version_unique_idx" }
      );

      await createIndexSafely(
        { projectName: 1, fileName: 1, version: -1 },
        { name: "project_file_version_idx" }
      );

      await createIndexSafely(
        { projectName: 1, fileName: 1, createdAt: -1 },
        { name: "project_file_created_idx" }
      );

      await createIndexSafely(
        { createdAt: 1 },
        { name: "version_created_cleanup_idx" }
      );

      console.log("✅ File version indexes setup completed");
    } catch (error) {
      console.warn("⚠️ Failed to setup file version indexes:", error);
    }
  }

  private mongoDocumentToFileVersion(doc: MongoFileVersionDocument): FileVersion {
    return FileVersionSchema.parse({
      id: doc.id,
      fileId: doc.fileId,
      projectName: doc.projectName,
      fileName: doc.fileName,
      content: doc.content,
      version: doc.version,
      checksum: doc.checksum,
      size: doc.size,
      createdAt: doc.createdAt,
      metadata: doc.metadata,
    });
  }

  async createVersion(fileVersionInput: Omit<FileVersion, 'id'>): Promise<FileVersion> {
    try {
      const mongoDoc: MongoFileVersionDocument = {
        id: randomUUID(),
        ...fileVersionInput,
      };

      const validatedVersion = this.mongoDocumentToFileVersion(mongoDoc);
      await this.collection.insertOne(mongoDoc);

      return validatedVersion;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.issues);
      }
      throw new StorageError(
        `Failed to create version ${fileVersionInput.version} for file ${fileVersionInput.fileName}`,
        error as Error
      );
    }
  }

  async getVersions(projectName: string, fileName: string): Promise<FileVersion[]> {
    try {
      const versions = await this.collection
        .find({ projectName, fileName })
        .sort({ version: -1 })
        .toArray();

      return versions.map(doc => this.mongoDocumentToFileVersion(doc));
    } catch (error) {
      throw new StorageError(
        `Failed to get versions for file ${fileName} in project ${projectName}`,
        error as Error
      );
    }
  }

  async getVersion(projectName: string, fileName: string, version: number): Promise<FileVersion | null> {
    try {
      const doc = await this.collection.findOne({
        projectName,
        fileName,
        version,
      });

      return doc ? this.mongoDocumentToFileVersion(doc) : null;
    } catch (error) {
      throw new StorageError(
        `Failed to get version ${version} for file ${fileName} in project ${projectName}`,
        error as Error
      );
    }
  }

  async getLatestVersionNumber(projectName: string, fileName: string): Promise<number> {
    try {
      const latestVersion = await this.collection
        .findOne(
          { projectName, fileName },
          { sort: { version: -1 }, projection: { version: 1 } }
        );

      return latestVersion?.version || 0;
    } catch (error) {
      throw new StorageError(
        `Failed to get latest version number for file ${fileName} in project ${projectName}`,
        error as Error
      );
    }
  }

  async cleanupOldVersions(projectName: string, fileName: string, config: VersioningConfig): Promise<number> {
    try {
      const versions = await this.collection
        .find({ projectName, fileName })
        .sort({ version: -1 })
        .toArray();

      let deletedCount = 0;

      // Keep only the latest N versions
      if (versions.length > config.maxVersionsPerFile) {
        const versionsToDelete = versions.slice(config.maxVersionsPerFile);
        const versionNumbers = versionsToDelete.map(v => v.version);
        
        const result = await this.collection.deleteMany({
          projectName,
          fileName,
          version: { $in: versionNumbers },
        });
        
        deletedCount += result.deletedCount || 0;
      }

      // Delete versions older than configured days
      if (config.autoCleanupOldVersions && config.preserveVersionsForDays > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - config.preserveVersionsForDays);

        const result = await this.collection.deleteMany({
          projectName,
          fileName,
          createdAt: { $lt: cutoffDate },
        });

        deletedCount += result.deletedCount || 0;
      }

      return deletedCount;
    } catch (error) {
      throw new StorageError(
        `Failed to cleanup old versions for file ${fileName} in project ${projectName}`,
        error as Error
      );
    }
  }

  async deleteAllVersions(projectName: string, fileName: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteMany({
        projectName,
        fileName,
      });

      return (result.deletedCount || 0) > 0;
    } catch (error) {
      throw new StorageError(
        `Failed to delete all versions for file ${fileName} in project ${projectName}`,
        error as Error
      );
    }
  }

  async deleteProjectVersions(projectName: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteMany({ projectName });
      return (result.deletedCount || 0) > 0;
    } catch (error) {
      throw new StorageError(
        `Failed to delete all versions for project ${projectName}`,
        error as Error
      );
    }
  }
}
