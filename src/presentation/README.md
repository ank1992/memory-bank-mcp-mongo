# Presentation Layer

The presentation layer handles all external communication for the Memory Bank MCP server, implementing the Model Context Protocol (MCP) interface and managing request/response cycles.

## 🎯 Purpose

- Implement MCP protocol endpoints
- Handle request validation and response formatting
- Coordinate between external requests and business logic
- Manage error handling and HTTP status codes

## 📁 Structure

```
presentation/
├── controllers/        # MCP endpoint implementations
│   ├── cleanup-old-versions/        # Version cleanup endpoint
│   ├── compare-file-versions/       # Version comparison endpoint
│   ├── create-project-from-template/ # Template instantiation endpoint
│   ├── delete-file/                 # File deletion endpoint
│   ├── delete-project/              # Project deletion endpoint
│   ├── get-file-version/            # Version retrieval endpoint
│   ├── get-file-versions/           # Version listing endpoint
│   ├── get-files-by-tags/           # Tag-based search endpoint
│   ├── get-project-stats/           # Statistics endpoint
│   ├── get-project-templates/       # Template listing endpoint
│   ├── install-predefined-templates/ # Template installation endpoint
│   ├── list-project-files/          # File listing endpoint
│   ├── list-projects/               # Project listing endpoint
│   ├── merge-files/                 # File merging endpoint
│   ├── read/                        # File reading endpoint (memory_bank_read)
│   ├── revert-file-to-version/      # Version reversion endpoint
│   ├── search-project-files/        # File search endpoint
│   ├── update/                      # File updating endpoint (memory_bank_update)
│   ├── write/                       # File creation endpoint (memory_bank_write)
│   └── index.ts                     # Controller exports
├── errors/             # Error handling
│   ├── mcp-error.ts                 # MCP-specific error types
│   └── index.ts                     # Error exports
├── helpers/            # Utility functions
│   ├── http-helpers.ts              # HTTP response helpers
│   └── index.ts                     # Helper exports
└── protocols/          # Interface definitions
    ├── controller.ts                # Base controller interface
    ├── http.ts                      # HTTP types
    └── index.ts                     # Protocol exports
```

## 🌐 MCP Tool Endpoints

### Core File Operations

#### `memory_bank_write`

- **Controller**: `WriteController`
- **Purpose**: Create new files in projects
- **Parameters**:
  - `projectId: string` - Target project identifier
  - `path: string` - File path within project
  - `content: string` - File content
  - `encoding?: string` - Content encoding (default: utf8)
- **Response**: File creation confirmation with metadata

#### `memory_bank_read`

- **Controller**: `ReadController`
- **Purpose**: Retrieve file content and metadata
- **Parameters**:
  - `projectId: string` - Project identifier
  - `path: string` - File path to read
- **Response**: File content and metadata

#### `memory_bank_update`

- **Controller**: `UpdateController`
- **Purpose**: Modify existing files with version tracking
- **Parameters**:
  - `projectId: string` - Project identifier
  - `path: string` - File path to update
  - `content: string` - New file content
  - `encoding?: string` - Content encoding
- **Response**: Update confirmation with new version info

#### `memory_bank_merge`

- **Controller**: `MergeFilesController`
- **Purpose**: Combine all project files into one document
- **Parameters**:
  - `projectId: string` - Project to merge
  - `outputPath?: string` - Target file path (optional)
- **Response**: Merged file content and cleanup summary

### Project Management

#### `list_projects`

- **Controller**: `ListProjectsController`
- **Purpose**: List all projects with statistics
- **Parameters**: None
- **Response**: Array of projects with file counts and sizes

#### `list_project_files`

- **Controller**: `ListProjectFilesController`
- **Purpose**: List files within a specific project
- **Parameters**:
  - `projectId: string` - Project identifier
- **Response**: Array of file metadata

#### `get_project_stats`

- **Controller**: `GetProjectStatsController`
- **Purpose**: Get detailed project statistics
- **Parameters**:
  - `projectId: string` - Project identifier
- **Response**: Comprehensive project metrics

#### `delete_project`

- **Controller**: `DeleteProjectController`
- **Purpose**: Remove project and all associated data
- **Parameters**:
  - `projectId: string` - Project to delete
- **Response**: Deletion confirmation

### File Management

#### `delete_file`

- **Controller**: `DeleteFileController`
- **Purpose**: Remove specific files from projects
- **Parameters**:
  - `projectId: string` - Project identifier
  - `path: string` - File path to delete
- **Response**: Deletion confirmation

#### `search_project_files`

- **Controller**: `SearchProjectFilesController`
- **Purpose**: Search files by content or metadata
- **Parameters**:
  - `projectId: string` - Project to search
  - `query: string` - Search query
  - `searchIn?: string[]` - Fields to search (content, name, tags)
- **Response**: Array of matching files

#### `get_files_by_tags`

- **Controller**: `GetFilesByTagsController`
- **Purpose**: Retrieve files by tag filtering
- **Parameters**:
  - `projectId: string` - Project identifier
  - `tags: string[]` - Tags to match
- **Response**: Array of tagged files

### Version Control

#### `get_file_versions`

- **Controller**: `GetFileVersionsController`
- **Purpose**: List all versions of a specific file
- **Parameters**:
  - `projectId: string` - Project identifier
  - `path: string` - File path
- **Response**: Array of file versions

#### `get_file_version`

- **Controller**: `GetFileVersionController`
- **Purpose**: Retrieve specific file version content
- **Parameters**:
  - `projectId: string` - Project identifier
  - `path: string` - File path
  - `version: number` - Version number to retrieve
- **Response**: Version content and metadata

#### `compare_file_versions`

- **Controller**: `CompareFileVersionsController`
- **Purpose**: Compare content between file versions
- **Parameters**:
  - `projectId: string` - Project identifier
  - `path: string` - File path
  - `version1: number` - First version to compare
  - `version2: number` - Second version to compare
- **Response**: Diff and comparison results

#### `revert_file_to_version`

- **Controller**: `RevertFileToVersionController`
- **Purpose**: Restore file to a previous version
- **Parameters**:
  - `projectId: string` - Project identifier
  - `path: string` - File path
  - `version: number` - Target version number
- **Response**: Reversion confirmation

#### `cleanup_old_versions`

- **Controller**: `CleanupOldVersionsController`
- **Purpose**: Remove old file versions based on retention policy
- **Parameters**:
  - `projectId: string` - Project identifier
  - `path?: string` - Specific file (optional, cleans all if omitted)
  - `keepCount: number` - Number of versions to retain
- **Response**: Cleanup summary

### Template System

#### `get_project_templates`

- **Controller**: `GetProjectTemplatesController`
- **Purpose**: List available project templates
- **Parameters**: None
- **Response**: Array of template definitions

#### `create_project_from_template`

- **Controller**: `CreateProjectFromTemplateController`
- **Purpose**: Generate new project from template
- **Parameters**:
  - `templateId: string` - Template identifier
  - `projectId: string` - New project identifier
  - `variables?: Record<string, string>` - Template variables
- **Response**: Project creation confirmation

#### `install_predefined_templates`

- **Controller**: `InstallPredefinedTemplatesController`
- **Purpose**: Install system templates
- **Parameters**: None
- **Response**: Installation confirmation

## 🛠️ Controller Architecture

### Base Controller Interface

```typescript
interface Controller {
  handle(request: HttpRequest): Promise<HttpResponse>;
}
```

### Typical Controller Structure

```typescript
export class ExampleController implements Controller {
  constructor(
    private readonly useCase: ExampleUseCase,
    private readonly validator: Validator
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      // 1. Validate request parameters
      const validatedParams = this.validator.validate(request.params);

      // 2. Execute business logic
      const result = await this.useCase.execute(validatedParams);

      // 3. Return success response
      return ok(result);
    } catch (error) {
      // 4. Handle errors appropriately
      return this.handleError(error);
    }
  }
}
```

## 🔧 Error Handling

### Error Types

- **`ValidationError`** - Invalid request parameters
- **`NotFoundError`** - Resource not found
- **`ConflictError`** - Resource conflict (duplicate files)
- **`InternalError`** - System or database errors

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### HTTP Status Mapping

- `200 OK` - Successful operations
- `400 Bad Request` - Validation errors
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflicts
- `500 Internal Server Error` - System errors

## 📝 Request Validation

### Validation Strategy

- **Parameter Validation**: Required fields, types, formats
- **Security Validation**: Path traversal, injection attacks
- **Business Validation**: Resource existence, permissions

### Validator Components

- **`RequiredFieldValidator`** - Ensures required parameters
- **`PathSecurityValidator`** - Prevents path traversal attacks
- **`ParamNameValidator`** - Validates parameter naming
- **`ValidatorComposite`** - Combines multiple validators

## 🎯 Design Patterns

### Controller Pattern

- **Purpose**: Handle HTTP requests and responses
- **Benefits**: Separation of concerns, testable endpoints
- **Implementation**: One controller per MCP tool

### Command Pattern

- **Purpose**: Encapsulate request operations
- **Benefits**: Uniform request handling, easy testing
- **Implementation**: Controllers execute use case commands

### Facade Pattern

- **Purpose**: Simplify complex use case interactions
- **Benefits**: Clean API surface, reduced coupling
- **Implementation**: Controllers as facades to business logic

## 🔗 Layer Dependencies

- **Dependencies**: Data layer (use cases), domain layer (entities)
- **Dependents**: Main layer (MCP server setup)
- **Principle**: Orchestrates business operations for external clients

## 🧪 Testing Strategy

### Controller Testing

- **Unit Tests**: Test request handling logic
- **Mock Dependencies**: Mock use cases and validators
- **Error Scenarios**: Test all error conditions

### Integration Testing

- **End-to-End**: Full request/response cycles
- **MCP Protocol**: Verify protocol compliance
- **Error Handling**: Test error response formats

### Test Structure

```
tests/presentation/controllers/
├── write/
│   └── write-controller.test.ts
├── read/
│   └── read-controller.test.ts
└── [other-controllers]/
    └── [controller].test.ts
```

## 📚 Related Documentation

- **[Data Layer](../data/README.md)** - Use case implementations
- **[Domain Layer](../domain/README.md)** - Business entities
- **[Main Layer](../main/)** - Application setup and MCP configuration
- **[Testing Guide](../../tests/README.md)** - Testing approaches

---

_The presentation layer provides a clean, well-documented API for MCP clients while maintaining proper error handling and validation._
