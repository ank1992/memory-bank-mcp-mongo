# Infrastructure Layer

The infrastructure layer handles all external concerns including database connections, storage implementations, and system integrations for the Memory Bank MCP server.

## 🎯 Purpose

- Implement repository interfaces with MongoDB
- Manage database connections and transactions
- Handle storage optimization and indexing
- Provide infrastructure abstractions

## 📁 Structure

```
infra/
├── database/           # Database implementations
│   ├── storage-factory.ts           # Storage implementation factory
│   └── mongodb/                     # MongoDB-specific implementations
│       ├── repositories/            # Repository implementations
│       │   ├── mongodb-file-repository.ts
│       │   ├── mongodb-project-repository.ts
│       │   ├── mongodb-file-version-repository.ts
│       │   └── mongodb-project-template-repository.ts
│       ├── connection/              # Database connection management
│       │   ├── mongodb-connection.ts
│       │   └── connection-config.ts
│       ├── indexes/                 # Database index definitions
│       │   ├── file-indexes.ts
│       │   ├── project-indexes.ts
│       │   └── version-indexes.ts
│       └── models/                  # MongoDB document models
│           ├── file-model.ts
│           ├── project-model.ts
│           ├── version-model.ts
│           └── template-model.ts
```

## 🗄️ MongoDB Implementation

### Database Schema

#### Files Collection
```typescript
interface FileDocument {
  _id: ObjectId;
  fileId: string;         // Unique identifier (indexed)
  projectId: string;      // Project reference (indexed)
  name: string;           // File name (indexed)
  path: string;           // File path (unique per project)
  content: string;        // File content
  encoding: string;       // Content encoding
  mimeType: string;       // MIME type
  size: number;           // File size in bytes
  checksum: string;       // Content hash (indexed)
  tags?: string[];        // Tags for categorization (indexed)
  metadata?: any;         // Extensible metadata
  createdAt: Date;        // Creation timestamp (indexed)
  updatedAt: Date;        // Last modification timestamp
}
```

#### Projects Collection
```typescript
interface ProjectDocument {
  _id: ObjectId;
  projectId: string;      // Unique identifier (indexed)
  name: string;           // Project name (unique)
  description?: string;   // Optional description
  tags?: string[];        // Project tags (indexed)
  settings?: any;         // Project settings
  createdAt: Date;        // Creation timestamp (indexed)
  updatedAt: Date;        // Last modification timestamp
}
```

#### File Versions Collection
```typescript
interface FileVersionDocument {
  _id: ObjectId;
  versionId: string;      // Unique version identifier (indexed)
  fileId: string;         // Reference to original file (indexed)
  projectId: string;      // Project context (indexed)
  versionNumber: number;  // Sequential version number
  content: string;        // Version content
  checksum: string;       // Content hash
  createdAt: Date;        // Version creation time (indexed)
  changeDescription?: string; // Optional change notes
}
```

#### Project Templates Collection
```typescript
interface ProjectTemplateDocument {
  _id: ObjectId;
  templateId: string;     // Unique template identifier (indexed)
  name: string;           // Template name (unique)
  description?: string;   // Template description
  author?: string;        // Template author
  version: string;        // Template version
  tags?: string[];        // Template tags (indexed)
  files: TemplateFile[];  // Template files
  settings?: any;         // Default settings
  createdAt: Date;        // Creation timestamp (indexed)
}
```

### Database Indexes

#### Performance Optimization Indexes
```typescript
// Files Collection Indexes
db.files.createIndex({ "projectId": 1, "path": 1 }, { unique: true });
db.files.createIndex({ "projectId": 1, "name": 1 });
db.files.createIndex({ "projectId": 1, "tags": 1 });
db.files.createIndex({ "checksum": 1 });
db.files.createIndex({ "createdAt": -1 });
db.files.createIndex({ "projectId": 1, "updatedAt": -1 });

// Projects Collection Indexes
db.projects.createIndex({ "projectId": 1 }, { unique: true });
db.projects.createIndex({ "name": 1 }, { unique: true });
db.projects.createIndex({ "tags": 1 });
db.projects.createIndex({ "createdAt": -1 });

// File Versions Collection Indexes
db.fileVersions.createIndex({ "fileId": 1, "versionNumber": -1 });
db.fileVersions.createIndex({ "projectId": 1, "createdAt": -1 });
db.fileVersions.createIndex({ "versionId": 1 }, { unique: true });

// Project Templates Collection Indexes
db.projectTemplates.createIndex({ "templateId": 1 }, { unique: true });
db.projectTemplates.createIndex({ "name": 1 }, { unique: true });
db.projectTemplates.createIndex({ "tags": 1 });
```

#### Text Search Indexes
```typescript
// Full-text search on file content and names
db.files.createIndex({
  "name": "text",
  "content": "text",
  "tags": "text"
}, {
  weights: {
    "name": 10,
    "tags": 5,
    "content": 1
  }
});
```

## 🔌 Repository Implementations

### MongoDBFileRepository
```typescript
export class MongoDBFileRepository implements FileRepository {
  constructor(private readonly db: Db) {}

  async writeFile(file: File): Promise<void> {
    const doc: FileDocument = this.toDocument(file);
    await this.db.collection('files').insertOne(doc);
  }

  async loadFile(projectId: string, path: string): Promise<File | null> {
    const doc = await this.db.collection('files')
      .findOne({ projectId, path });
    return doc ? this.fromDocument(doc) : null;
  }

  async listFiles(projectId: string): Promise<File[]> {
    const docs = await this.db.collection('files')
      .find({ projectId })
      .sort({ path: 1 })
      .toArray();
    return docs.map(doc => this.fromDocument(doc));
  }

  // ... other methods
}
```

### MongoDBProjectRepository
```typescript
export class MongoDBProjectRepository implements ProjectRepository {
  constructor(private readonly db: Db) {}

  async createProject(project: Project): Promise<void> {
    const doc: ProjectDocument = this.toDocument(project);
    await this.db.collection('projects').insertOne(doc);
  }

  async listProjects(): Promise<Project[]> {
    const docs = await this.db.collection('projects')
      .find({})
      .sort({ name: 1 })
      .toArray();
    return docs.map(doc => this.fromDocument(doc));
  }

  // ... other methods
}
```

## 🔧 Connection Management

### MongoDB Connection Setup
```typescript
export class MongoDBConnection {
  private client: MongoClient;
  private db: Db;

  constructor(private readonly config: ConnectionConfig) {}

  async connect(): Promise<void> {
    this.client = new MongoClient(this.config.url, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await this.client.connect();
    this.db = this.client.db(this.config.database);
    
    // Create indexes
    await this.createIndexes();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  getDatabase(): Db {
    return this.db;
  }
}
```

### Connection Configuration
```typescript
interface ConnectionConfig {
  url: string;          // MongoDB connection URL
  database: string;     // Database name
  options?: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    retryWrites?: boolean;
    w?: string | number;
    journal?: boolean;
  };
}
```

## 📊 Performance Optimizations

### Query Optimization
- **Indexed Queries**: All frequent queries use appropriate indexes
- **Projection**: Fetch only required fields to reduce bandwidth
- **Aggregation**: Use MongoDB aggregation pipeline for complex operations
- **Sorting**: Index-supported sorting for large datasets

### Caching Strategy
- **Connection Pooling**: Reuse database connections
- **Query Result Caching**: Cache frequently accessed data
- **Metadata Caching**: Cache project statistics and file counts

### Memory Management
- **Streaming**: Stream large file content to avoid memory issues
- **Batch Operations**: Use bulk operations for multiple documents
- **Cleanup**: Regular cleanup of old versions and temporary data

## 🔒 Security Measures

### Data Security
- **Input Sanitization**: Sanitize all inputs to prevent injection
- **Path Validation**: Validate file paths to prevent traversal attacks
- **Content Validation**: Validate file content and metadata

### Connection Security
- **Authentication**: Support for MongoDB authentication
- **SSL/TLS**: Encrypted connections for production
- **Network Security**: Proper firewall and network configuration

### Access Control
- **Database Users**: Dedicated database users with minimal privileges
- **Collection Permissions**: Granular permissions per collection
- **Audit Logging**: Track all database operations for security

## 🔄 Backup and Recovery

### Backup Strategy
- **Regular Backups**: Automated daily backups
- **Point-in-Time Recovery**: MongoDB oplog for point-in-time restoration
- **Cross-Region Backups**: Geographic backup distribution

### Data Integrity
- **Checksums**: Content integrity verification
- **Validation**: Document validation at database level
- **Consistency Checks**: Regular data consistency verification

## 🚀 Deployment Considerations

### Environment Configuration
```typescript
// Production Environment
export const productionConfig: ConnectionConfig = {
  url: process.env.MONGODB_URL!,
  database: process.env.MONGODB_DB || 'memory_bank',
  options: {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority',
    journal: true
  }
};

// Development Environment
export const developmentConfig: ConnectionConfig = {
  url: 'mongodb://localhost:27017',
  database: 'memory_bank_dev',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  }
};
```

### Monitoring and Logging
- **Performance Monitoring**: Track query performance and slow operations
- **Connection Monitoring**: Monitor connection pool health
- **Error Logging**: Comprehensive error logging and alerting

## 🧪 Testing Strategy

### Repository Testing
- **Integration Tests**: Test with real MongoDB instance
- **Mock Database**: Use in-memory MongoDB for unit tests
- **Performance Tests**: Test query performance and optimization

### Connection Testing
- **Connection Resilience**: Test connection failure scenarios
- **Timeout Handling**: Test various timeout configurations
- **Recovery Testing**: Test automatic connection recovery

## 📚 Related Documentation

- **[Data Layer](../data/README.md)** - Repository interfaces
- **[Main Layer](../main/)** - Infrastructure setup and configuration
- **[Source Overview](../README.md)** - Architecture overview
- **[Testing Guide](../../tests/README.md)** - Infrastructure testing

---

*The infrastructure layer provides robust, scalable, and secure MongoDB integration while maintaining clean separation from business logic.*
