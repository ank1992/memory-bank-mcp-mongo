# Domain Layer

The domain layer contains the core business logic and entities for the Memory Bank MCP server. This is the heart of the application where business rules and entities are defined.

## 🎯 Purpose

- Define core business entities and their relationships
- Establish business rules and invariants
- Provide interfaces for use cases (business operations)
- Maintain independence from external concerns

## 📁 Structure

```
domain/
├── entities/           # Core business entities
│   ├── file.ts            # File entity with metadata
│   ├── file-version.ts    # File version tracking
│   ├── project.ts         # Project container entity
│   ├── project-template.ts # Template for project creation
│   └── index.ts           # Entity exports
└── usecases/          # Business operation interfaces
    ├── delete-file.ts         # File deletion operations
    ├── delete-project.ts      # Project deletion operations
    ├── file-versioning.ts     # Version management
    ├── get-files-by-tags.ts   # Tag-based file retrieval
    ├── get-project-stats.ts   # Project statistics
    ├── list-project-files.ts  # File listing operations
    ├── list-projects.ts       # Project listing operations
    ├── merge-files.ts         # File merging operations
    ├── project-templates.ts   # Template management
    ├── read-file.ts           # File reading operations
    ├── search-project-files.ts # File search operations
    ├── update-file.ts         # File updating operations
    ├── write-file.ts          # File creation operations
    └── index.ts              # Use case exports
```

## 🏛️ Core Entities

### File Entity
```typescript
interface File {
  fileId: string;          // Unique identifier
  projectId: string;       // Parent project reference
  name: string;            // File name with extension
  path: string;            // File path within project
  content: string;         // File content
  encoding: string;        // Content encoding (utf8, base64)
  mimeType: string;        // MIME type for content
  size: number;            // File size in bytes
  checksum: string;        // Content hash for integrity
  tags?: string[];         // Optional tags for categorization
  metadata?: Record<string, any>; // Extensible metadata
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last modification timestamp
}
```

### Project Entity
```typescript
interface Project {
  projectId: string;       // Unique identifier
  name: string;            // Project name
  description?: string;    // Optional description
  tags?: string[];         // Project tags
  settings?: ProjectSettings; // Project-specific settings
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last modification timestamp
}
```

### FileVersion Entity
```typescript
interface FileVersion {
  versionId: string;       // Unique version identifier
  fileId: string;          // Reference to original file
  projectId: string;       // Project context
  versionNumber: number;   // Sequential version number
  content: string;         // Version content
  checksum: string;        // Content hash
  createdAt: Date;         // Version creation time
  changeDescription?: string; // Optional change notes
}
```

### ProjectTemplate Entity
```typescript
interface ProjectTemplate {
  templateId: string;      // Unique template identifier
  name: string;            // Template name
  description?: string;    // Template description
  author?: string;         // Template author
  version: string;         // Template version
  tags?: string[];         // Template tags
  files: TemplateFile[];   // Template files
  settings?: TemplateSettings; // Default settings
  createdAt: Date;         // Creation timestamp
}
```

## 🔄 Use Case Interfaces

### File Operations
- **`WriteFile`** - Create new files with validation
- **`ReadFile`** - Retrieve file content and metadata
- **`UpdateFile`** - Modify existing files with versioning
- **`DeleteFile`** - Remove files and their versions

### Project Operations
- **`ListProjects`** - Retrieve all projects with statistics
- **`GetProjectStats`** - Get detailed project metrics
- **`DeleteProject`** - Remove projects and all associated data

### File Management
- **`ListProjectFiles`** - List files within a project
- **`SearchProjectFiles`** - Search files by various criteria
- **`GetFilesByTags`** - Retrieve files by tag filtering
- **`MergeFiles`** - Combine multiple files into one

### Version Control
- **`FileVersioning`** - Manage file version history
- **`CompareFileVersions`** - Compare different file versions
- **`RevertFileToVersion`** - Restore file to previous version

### Template System
- **`ProjectTemplates`** - Manage project templates
- **`CreateProjectFromTemplate`** - Generate projects from templates
- **`InstallPredefinedTemplates`** - Install system templates

## 🎯 Business Rules

### File Management Rules
1. **Unique Paths**: Files must have unique paths within a project
2. **Content Integrity**: All files must have valid checksums
3. **Size Limits**: Files cannot exceed configured size limits
4. **Path Security**: File paths must be validated for security

### Version Control Rules
1. **Sequential Versioning**: Versions are numbered sequentially
2. **Immutable Versions**: Once created, versions cannot be modified
3. **Cleanup Policy**: Old versions may be cleaned up based on retention policy

### Project Rules
1. **Unique Names**: Project names must be unique across the system
2. **Isolation**: Projects are completely isolated from each other
3. **Cascading Deletes**: Deleting a project removes all associated data

### Template Rules
1. **Variable Substitution**: Templates support variable replacement
2. **File Structure**: Templates must define a valid file structure
3. **Settings Inheritance**: Projects inherit template settings

## 🔗 Layer Dependencies

- **Dependencies**: None (pure business logic)
- **Dependents**: Data layer, presentation layer
- **Principle**: Domain layer is the core with no external dependencies

## 🧪 Testing Approach

Domain entities and use cases should be tested with:
- **Unit Tests**: Test entity behavior and validation
- **Business Rule Tests**: Verify business logic enforcement
- **Interface Tests**: Ensure use case contracts are correct

## 📚 Related Documentation

- **[Data Layer](../data/README.md)** - Use case implementations
- **[Presentation Layer](../presentation/README.md)** - API endpoints
- **[Source Overview](../README.md)** - Architecture overview
- **[Testing Guide](../../tests/README.md)** - Testing strategies

---

*The domain layer forms the foundation of the Memory Bank MCP server, ensuring business logic remains clean and testable.*
