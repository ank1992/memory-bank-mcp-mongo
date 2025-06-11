import { MongoClient, Db, Collection } from "mongodb";
import { ProjectTemplateRepository } from "../../../data/protocols/project-template-repository.js";
import { ProjectTemplate, ProjectTemplateSchema } from "../../../domain/entities/project-template.js";
import { StorageError, ValidationError } from "../../../presentation/errors/enhanced-errors.js";
import { z } from "zod";
import { randomUUID } from "crypto";

interface MongoProjectTemplateDocument {
  _id?: any;
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author?: string;
  tags: string[];
  files: Array<{
    path: string;
    content: string;
    isVariable: boolean;
    description?: string;
  }>;
  variables: Array<{
    name: string;
    description: string;
    defaultValue?: string;
    required: boolean;
    type: 'string' | 'number' | 'boolean' | 'date';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoProjectTemplateRepository implements ProjectTemplateRepository {
  private db: Db;
  private collection: Collection<MongoProjectTemplateDocument>;

  constructor(client: MongoClient, dbName: string) {
    this.db = client.db(dbName);
    this.collection = this.db.collection<MongoProjectTemplateDocument>("project_templates");
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      const createIndexSafely = async (keys: any, options: any) => {
        try {
          await this.collection.createIndex(keys, options);
          console.log(`✅ Created template index: ${options.name || "unnamed"}`);
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
        { name: 1 },
        { unique: true, name: "template_name_unique_idx" }
      );

      await createIndexSafely(
        { category: 1 },
        { name: "template_category_idx" }
      );

      await createIndexSafely(
        { tags: 1 },
        { name: "template_tags_idx" }
      );

      await createIndexSafely(
        { createdAt: -1 },
        { name: "template_created_idx" }
      );

      console.log("✅ Project template indexes setup completed");
    } catch (error) {
      console.warn("⚠️ Failed to setup project template indexes:", error);
    }
  }

  private mongoDocumentToProjectTemplate(doc: MongoProjectTemplateDocument): ProjectTemplate {
    return ProjectTemplateSchema.parse({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      category: doc.category,
      version: doc.version,
      author: doc.author,
      tags: doc.tags,
      files: doc.files,
      variables: doc.variables,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTemplate> {
    try {
      const now = new Date();
      const mongoDoc: MongoProjectTemplateDocument = {
        id: randomUUID(),
        ...template,
        createdAt: now,
        updatedAt: now,
      };

      const validatedTemplate = this.mongoDocumentToProjectTemplate(mongoDoc);
      await this.collection.insertOne(mongoDoc);

      return validatedTemplate;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.issues);
      }
      throw new StorageError(
        `Failed to create template ${template.name}`,
        error as Error
      );
    }
  }

  async getAll(category?: string, tags?: string[]): Promise<ProjectTemplate[]> {
    try {
      const filter: any = {};
      
      if (category) {
        filter.category = category;
      }
      
      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      const templates = await this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();

      return templates.map(doc => this.mongoDocumentToProjectTemplate(doc));
    } catch (error) {
      throw new StorageError("Failed to get project templates", error as Error);
    }
  }

  async getById(templateId: string): Promise<ProjectTemplate | null> {
    try {
      const doc = await this.collection.findOne({ id: templateId });
      return doc ? this.mongoDocumentToProjectTemplate(doc) : null;
    } catch (error) {
      throw new StorageError(
        `Failed to get template with ID ${templateId}`,
        error as Error
      );
    }
  }

  async getByName(name: string): Promise<ProjectTemplate | null> {
    try {
      const doc = await this.collection.findOne({ name });
      return doc ? this.mongoDocumentToProjectTemplate(doc) : null;
    } catch (error) {
      throw new StorageError(
        `Failed to get template with name ${name}`,
        error as Error
      );
    }
  }

  async update(
    templateId: string, 
    updates: Partial<Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ProjectTemplate | null> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const result = await this.collection.findOneAndUpdate(
        { id: templateId },
        { $set: updateData },
        { returnDocument: "after" }
      );

      return result ? this.mongoDocumentToProjectTemplate(result) : null;
    } catch (error) {
      throw new StorageError(
        `Failed to update template ${templateId}`,
        error as Error
      );
    }
  }

  async delete(templateId: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ id: templateId });
      return (result.deletedCount || 0) > 0;
    } catch (error) {
      throw new StorageError(
        `Failed to delete template ${templateId}`,
        error as Error
      );
    }
  }

  async exists(templateId: string): Promise<boolean> {
    try {
      const count = await this.collection.countDocuments({ id: templateId });
      return count > 0;
    } catch (error) {
      throw new StorageError(
        `Failed to check if template ${templateId} exists`,
        error as Error
      );
    }
  }

  async getByCategory(category: string): Promise<ProjectTemplate[]> {
    try {
      const templates = await this.collection
        .find({ category })
        .sort({ createdAt: -1 })
        .toArray();

      return templates.map(doc => this.mongoDocumentToProjectTemplate(doc));
    } catch (error) {
      throw new StorageError(
        `Failed to get templates for category ${category}`,
        error as Error
      );
    }
  }

  async getByTags(tags: string[]): Promise<ProjectTemplate[]> {
    try {
      const templates = await this.collection
        .find({ tags: { $in: tags } })
        .sort({ createdAt: -1 })
        .toArray();

      return templates.map(doc => this.mongoDocumentToProjectTemplate(doc));
    } catch (error) {
      throw new StorageError(
        `Failed to get templates with tags ${tags.join(', ')}`,
        error as Error
      );
    }
  }
}
