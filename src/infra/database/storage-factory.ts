import { Config } from "../../main/config/config.js";
import { FileRepository } from "../../data/protocols/file-repository.js";
import { ProjectRepository } from "../../data/protocols/project-repository.js";
import { FileVersionRepository } from "../../data/protocols/file-version-repository.js";
import { ProjectTemplateRepository } from "../../data/protocols/project-template-repository.js";
import { MongoFileRepository } from "./mongodb/mongo-file-repository.js";
import { MongoProjectRepository } from "./mongodb/mongo-project-repository.js";
import { MongoFileVersionRepository } from "./mongodb/mongo-file-version-repository.js";
import { MongoProjectTemplateRepository } from "./mongodb/mongo-project-template-repository.js";
import { MongoClient } from "mongodb";
import { ConnectionError } from "../../presentation/errors/enhanced-errors.js";

export class StorageFactory {
  static async createRepositories(config: Config): Promise<{
    fileRepository: FileRepository;
    projectRepository: ProjectRepository;
    fileVersionRepository: FileVersionRepository;
    projectTemplateRepository: ProjectTemplateRepository;
  }> {
    try {
      const client = new MongoClient(config.mongodb.connectionString);
      await client.connect();      // Test the connection
      await client.db(config.mongodb.databaseName).admin().ping();
      console.log(`✅ Connected to MongoDB: ${config.mongodb.databaseName}`);

      // Créer d'abord le ProjectRepository
      const projectRepository = new MongoProjectRepository(
        client,
        config.mongodb.databaseName
      );

      // Créer le FileVersionRepository
      const fileVersionRepository = new MongoFileVersionRepository(
        client,
        config.mongodb.databaseName
      );

      // Créer le ProjectTemplateRepository
      const projectTemplateRepository = new MongoProjectTemplateRepository(
        client,
        config.mongodb.databaseName
      );

      // Puis créer le FileRepository avec la référence au ProjectRepository et FileVersionRepository
      const fileRepository = new MongoFileRepository(
        client,
        config.mongodb.databaseName,
        projectRepository,
        fileVersionRepository
      );

      return {
        fileRepository,
        projectRepository,
        fileVersionRepository,
        projectTemplateRepository,
      };
    } catch (error) {
      throw new ConnectionError("Failed to connect to MongoDB", error as Error);
    }
  }
  static async closeConnections(repositories: {
    fileRepository: FileRepository;
    projectRepository: ProjectRepository;
    fileVersionRepository: FileVersionRepository;
    projectTemplateRepository: ProjectTemplateRepository;
  }): Promise<void> {
    // Close MongoDB connections if they are MongoDB repositories
    const mongoFileRepo = repositories.fileRepository as any;
    if (
      mongoFileRepo.client &&
      typeof mongoFileRepo.client.close === "function"
    ) {
      await mongoFileRepo.client.close();
    }
  }
}
