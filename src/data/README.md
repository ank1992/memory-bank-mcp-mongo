# Data Layer

The data layer implements the persistence logic and use case implementations for the Memory Bank MCP server. It acts as a bridge between the domain layer and the infrastructure layer.

## 🎯 Purpose

- Implement domain use case interfaces
- Define repository contracts for data access
- Coordinate between domain entities and infrastructure
- Handle data transformation and validation

## 📁 Structure

```
data/
├── protocols/          # Repository interface definitions
│   ├── file-repository.ts              # File storage contract
│   ├── file-version-repository.ts      # Version storage contract
│   ├── project-repository.ts           # Project storage contract
│   ├── project-template-repository.ts  # Template storage contract
│   └── index.ts                        # Protocol exports
└── usecases/          # Use case implementations
    ├── cleanup-old-versions/        # Version cleanup logic
    ├── compare-file-versions/       # Version comparison
    ├── create-project-from-template/ # Template instantiation
    ├── create-project-template/     # Template creation
    ├── delete-file/                 # File deletion logic
    ├── delete-project/              # Project deletion logic
    ├── get-file-version/            # Version retrieval
    ├── get-file-versions/           # Version listing
    ├── get-files-by-tags/           # Tag-based search
    ├── get-project-stats/           # Statistics calculation
    ├── get-project-templates/       # Template listing
    ├── install-predefined-templates/ # System template setup
    ├── list-project-files/          # File listing logic
    ├── list-projects/               # Project listing logic
    ├── merge-files/                 # File merging logic
    ├── read-file/                   # File reading logic
    ├── revert-file-to-version/      # Version reversion
    ├── search-project-files/        # File search logic
    ├── update-file/                 # File updating logic
    └── write-file/                  # File creation logic
```

## 🔌 Repository Protocols

### FileRepository
```typescript
interface FileRepository {
  writeFile(file: File): Promise<void>;
  loadFile(projectId: string, path: string): Promise<File | null>;
  listFiles(projectId: string): Promise<File[]>;
  updateFile(file: File): Promise<void>;
  deleteFile(projectId: string, path: string): Promise<void>;
  searchFiles(projectId: string, query: SearchQuery): Promise<File[]>;
  getFilesByTags(projectId: string, tags: string[]): Promise<File[]>;
  getProjectStats(projectId: string): Promise<ProjectStats>;
}
```

### ProjectRepository
```typescript
interface ProjectRepository {
  createProject(project: Project): Promise<void>;
  getProject(projectId: string): Promise<Project | null>;
  listProjects(): Promise<Project[]>;
  updateProject(project: Project): Promise<void>;
  deleteProject(projectId: string): Promise<void>;
  projectExists(projectId: string): Promise<boolean>;
}
```

### FileVersionRepository
```typescript
interface FileVersionRepository {
  createVersion(version: FileVersion): Promise<void>;
  getVersion(versionId: string): Promise<FileVersion | null>;
  getFileVersions(fileId: string): Promise<FileVersion[]>;
  getLatestVersionNumber(fileId: string): Promise<number>;
  deleteAllVersions(fileId: string): Promise<void>;
  deleteProjectVersions(projectId: string): Promise<void>;
  cleanupOldVersions(fileId: string, keepCount: number): Promise<void>;
}
```

### ProjectTemplateRepository
```typescript
interface ProjectTemplateRepository {
  createTemplate(template: ProjectTemplate): Promise<void>;
  getTemplate(templateId: string): Promise<ProjectTemplate | null>;
  listTemplates(): Promise<ProjectTemplate[]>;
  updateTemplate(template: ProjectTemplate): Promise<void>;
  deleteTemplate(templateId: string): Promise<void>;
  installPredefinedTemplates(): Promise<void>;
}
```

## 🔄 Use Case Implementations

### File Operations

#### WriteFile Use Case
- **Purpose**: Create new files with validation and metadata
- **Process**: 
  1. Validate file data and path security
  2. Generate unique file ID and checksum
  3. Store file through repository
  4. Update project statistics

#### ReadFile Use Case
- **Purpose**: Retrieve file content and metadata
- **Process**:
  1. Validate project and path parameters
  2. Load file from repository
  3. Return file data or not found error

#### UpdateFile Use Case
- **Purpose**: Modify existing files with version tracking
- **Process**:
  1. Load existing file
  2. Create version backup
  3. Update file content and metadata
  4. Store updated file

### Project Operations

#### ListProjects Use Case
- **Purpose**: Retrieve all projects with real-time statistics
- **Process**:
  1. Load all projects from repository
  2. Calculate statistics for each project
  3. Return enriched project data

#### DeleteProject Use Case
- **Purpose**: Remove projects and all associated data
- **Process**:
  1. Validate project exists
  2. Delete all project files
  3. Delete all file versions
  4. Delete project record

### Version Control

#### CompareFileVersions Use Case
- **Purpose**: Compare content between file versions
- **Process**:
  1. Load specified versions
  2. Generate content diff
  3. Return comparison results

#### RevertFileToVersion Use Case
- **Purpose**: Restore file to a previous version
- **Process**:
  1. Load target version
  2. Create backup of current content
  3. Update file with version content

### Template System

#### CreateProjectFromTemplate Use Case
- **Purpose**: Generate new projects from templates
- **Process**:
  1. Load template definition
  2. Process variable substitutions
  3. Create project structure
  4. Generate template files

## 🎯 Design Patterns

### Repository Pattern
- **Purpose**: Abstract data access details
- **Benefits**: Testable, swappable storage implementations
- **Implementation**: Interface in data layer, concrete in infrastructure

### Use Case Pattern
- **Purpose**: Encapsulate business operations
- **Benefits**: Single responsibility, testable business logic
- **Implementation**: One class per business operation

### Dependency Inversion
- **Purpose**: Depend on abstractions, not concretions
- **Benefits**: Flexible, testable, maintainable
- **Implementation**: Repositories injected into use cases

## 🔗 Layer Dependencies

- **Dependencies**: Domain layer (entities, use case interfaces)
- **Dependents**: Presentation layer, infrastructure layer
- **Principle**: Implements domain contracts, depends only on domain

## 🧪 Testing Strategy

### Repository Testing
- **Mock Implementation**: In-memory test repositories
- **Contract Testing**: Verify interface compliance
- **Integration Testing**: Test with real database

### Use Case Testing
- **Unit Testing**: Test business logic with mocked repositories
- **Behavior Testing**: Verify use case contracts
- **Error Handling**: Test failure scenarios

### Test Structure
```
tests/data/usecases/
├── write-file/
│   └── write-file.spec.ts
├── read-file/
│   └── read-file.spec.ts
└── [other-use-cases]/
    └── [use-case].spec.ts
```

## 📊 Performance Considerations

### Caching Strategy
- **Project Stats**: Cache frequently accessed statistics
- **File Metadata**: Cache file metadata for quick access
- **Version Counts**: Cache version numbers to avoid queries

### Query Optimization
- **Indexing**: Proper database indexes for common queries
- **Pagination**: Support for large file lists
- **Filtering**: Efficient tag and search filtering

### Memory Management
- **Streaming**: Stream large file content
- **Cleanup**: Automatic cleanup of old versions
- **Batching**: Batch operations for better performance

## 📚 Related Documentation

- **[Domain Layer](../domain/README.md)** - Business entities and rules
- **[Infrastructure Layer](../infra/README.md)** - Repository implementations
- **[Presentation Layer](../presentation/README.md)** - API controllers
- **[Testing Guide](../../tests/README.md)** - Testing approaches

---

*The data layer ensures clean separation between business logic and data persistence while maintaining high performance and reliability.*
