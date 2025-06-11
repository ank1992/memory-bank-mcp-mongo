# Testing Guide

This guide covers the testing strategy, structure, and best practices for the Memory Bank MCP MongoDB server.

## 🎯 Testing Philosophy

- **Test-Driven Development**: Write tests first, then implementation
- **Clean Architecture Testing**: Test each layer independently
- **Comprehensive Coverage**: Unit, integration, and end-to-end tests
- **Fast Feedback**: Quick test execution for rapid development

## 📁 Test Structure

```
tests/
├── setup.ts                    # Global test configuration
├── data/                       # Data layer tests
│   ├── mocks/                  # Mock repositories and dependencies
│   │   ├── file-repository-stub.ts
│   │   ├── project-repository-stub.ts
│   │   └── file-version-repository-stub.ts
│   └── usecases/               # Use case implementation tests
│       ├── write-file/
│       ├── read-file/
│       ├── create-project-from-template/
│       └── [other-use-cases]/
├── infra/                      # Infrastructure layer tests
│   └── filesystem/             # File system implementation tests
├── presentation/               # Presentation layer tests
│   ├── controllers/            # Controller tests
│   │   ├── write/
│   │   ├── read/
│   │   ├── get-project-templates/
│   │   └── [other-controllers]/
│   ├── helpers/                # Helper function tests
│   └── mocks/                  # Mock use cases and dependencies
└── validators/                 # Validator tests
    ├── required-field-validator.test.ts
    ├── path-security-validator.test.ts
    └── validator-composite.test.ts
```

## 🧪 Testing Layers

### Unit Testing

#### Domain Layer Testing
```typescript
// Example: Testing domain entities
describe('File Entity', () => {
  it('should create file with valid data', () => {
    const file = new File({
      fileId: 'file-123',
      projectId: 'project-1',
      name: 'test.txt',
      path: '/docs/test.txt',
      content: 'Hello World',
      encoding: 'utf8',
      mimeType: 'text/plain',
      size: 11,
      checksum: 'abc123',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    expect(file.fileId).toBe('file-123');
    expect(file.name).toBe('test.txt');
  });

  it('should validate required fields', () => {
    expect(() => new File({} as any)).toThrow('Invalid file data');
  });
});
```

#### Use Case Testing
```typescript
// Example: Testing use case implementation
describe('WriteFileUseCase', () => {
  let useCase: WriteFileUseCase;
  let fileRepository: FileRepositoryStub;
  let projectRepository: ProjectRepositoryStub;

  beforeEach(() => {
    fileRepository = new FileRepositoryStub();
    projectRepository = new ProjectRepositoryStub();
    useCase = new WriteFileUseCase(fileRepository, projectRepository);
  });

  it('should write file successfully', async () => {
    const request = {
      projectId: 'project-1',
      path: '/test.txt',
      content: 'Hello World',
      encoding: 'utf8'
    };

    const result = await useCase.execute(request);

    expect(result.fileId).toBeDefined();
    expect(fileRepository.files).toHaveLength(1);
  });

  it('should reject duplicate file paths', async () => {
    // Create existing file
    await fileRepository.writeFile(createMockFile());

    const request = {
      projectId: 'project-1',
      path: '/test.txt',
      content: 'New content'
    };

    await expect(useCase.execute(request)).rejects.toThrow('File already exists');
  });
});
```

### Integration Testing

#### Repository Integration
```typescript
// Example: Testing MongoDB repository
describe('MongoDBFileRepository Integration', () => {
  let repository: MongoDBFileRepository;
  let db: Db;

  beforeAll(async () => {
    // Setup test database
    db = await setupTestDatabase();
    repository = new MongoDBFileRepository(db);
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  it('should store and retrieve files', async () => {
    const file = createMockFile();
    
    await repository.writeFile(file);
    const retrieved = await repository.loadFile(file.projectId, file.path);
    
    expect(retrieved).toEqual(file);
  });
});
```

#### Controller Integration
```typescript
// Example: Testing controller with real dependencies
describe('WriteController Integration', () => {
  let controller: WriteController;
  let testDatabase: TestDatabase;

  beforeAll(async () => {
    testDatabase = await setupTestDatabase();
    const repositories = createRepositories(testDatabase.db);
    const useCases = createUseCases(repositories);
    controller = new WriteController(useCases.writeFile, new ValidatorComposite([]));
  });

  it('should handle complete write request', async () => {
    const request = createHttpRequest({
      projectId: 'test-project',
      path: '/test.txt',
      content: 'Hello World'
    });

    const response = await controller.handle(request);

    expect(response.statusCode).toBe(200);
    expect(response.body.fileId).toBeDefined();
  });
});
```

### End-to-End Testing

#### MCP Protocol Testing
```typescript
// Example: Full MCP tool testing
describe('MCP Tools E2E', () => {
  let mcpServer: MCPServer;

  beforeAll(async () => {
    mcpServer = await startTestMCPServer();
  });

  afterAll(async () => {
    await mcpServer.stop();
  });

  it('should handle complete file lifecycle', async () => {
    // Write file
    const writeResponse = await mcpServer.callTool('memory_bank_write', {
      projectId: 'test-project',
      path: '/test.txt',
      content: 'Hello World'
    });
    expect(writeResponse.isError).toBe(false);

    // Read file
    const readResponse = await mcpServer.callTool('memory_bank_read', {
      projectId: 'test-project',
      path: '/test.txt'
    });
    expect(readResponse.content.content).toBe('Hello World');

    // Update file
    const updateResponse = await mcpServer.callTool('memory_bank_update', {
      projectId: 'test-project',
      path: '/test.txt',
      content: 'Updated content'
    });
    expect(updateResponse.isError).toBe(false);

    // List projects
    const listResponse = await mcpServer.callTool('list_projects', {});
    expect(listResponse.content).toContainEqual(
      expect.objectContaining({ projectId: 'test-project' })
    );
  });
});
```

## 🛠️ Test Utilities

### Mock Repositories
```typescript
// FileRepositoryStub for testing
export class FileRepositoryStub implements FileRepository {
  public files: File[] = [];

  async writeFile(file: File): Promise<void> {
    if (this.files.some(f => f.projectId === file.projectId && f.path === file.path)) {
      throw new Error('File already exists');
    }
    this.files.push(file);
  }

  async loadFile(projectId: string, path: string): Promise<File | null> {
    return this.files.find(f => f.projectId === projectId && f.path === path) || null;
  }

  // ... other methods
}
```

### Test Data Factories
```typescript
// Factory for creating test data
export const createMockFile = (overrides: Partial<File> = {}): File => ({
  fileId: 'test-file-id',
  projectId: 'test-project',
  name: 'test.txt',
  path: '/test.txt',
  content: 'Test content',
  encoding: 'utf8',
  mimeType: 'text/plain',
  size: 12,
  checksum: 'test-checksum',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  projectId: 'test-project',
  name: 'Test Project',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});
```

### Database Test Setup
```typescript
// Test database utilities
export const setupTestDatabase = async (): Promise<TestDatabase> => {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  
  const dbName = `test_memory_bank_${Date.now()}`;
  const db = client.db(dbName);
  
  return { client, db, dbName };
};

export const cleanupTestDatabase = async (testDb: TestDatabase): Promise<void> => {
  await testDb.client.db(testDb.dbName).dropDatabase();
  await testDb.client.close();
};
```

## ⚡ Test Configuration

### Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.spec.ts", "**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.d.ts",
        "**/*.spec.ts",
        "**/*.test.ts",
      ],
    },
  },
});
```

### Global Test Setup
```typescript
// tests/setup.ts
import { vi, beforeEach, afterEach } from 'vitest';

// Mock console methods to prevent unwanted output during tests
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

## 📊 Test Coverage

### Coverage Targets
- **Unit Tests**: 90%+ line coverage
- **Integration Tests**: All repository implementations
- **E2E Tests**: All MCP tools and major workflows

### Coverage Reports
```bash
# Generate coverage report
pnpm test:coverage

# View coverage report
pnpm test:coverage:view
```

### Critical Coverage Areas
- **Domain Entities**: 100% coverage (core business logic)
- **Use Cases**: 95%+ coverage (business operations)
- **Controllers**: 90%+ coverage (API endpoints)
- **Repositories**: 85%+ coverage (data access)

## 🚀 Running Tests

### Development Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test write-file.spec.ts

# Run tests with coverage
pnpm test:coverage
```

### CI/CD Testing
```bash
# Run tests with coverage and reporting
pnpm test:ci

# Lint and test
pnpm test:full
```

### Performance Testing
```bash
# Run performance benchmarks
pnpm test:performance

# Memory usage testing
pnpm test:memory
```

## 🔧 Testing Best Practices

### 1. Test Structure (AAA Pattern)
```typescript
describe('Feature', () => {
  it('should behavior', () => {
    // Arrange
    const input = createTestData();
    
    // Act
    const result = performOperation(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### 2. Test Isolation
- Each test should be independent
- Use `beforeEach` and `afterEach` for setup/cleanup
- Don't rely on test execution order

### 3. Descriptive Test Names
```typescript
// Good
it('should create file when valid data provided')
it('should throw error when file already exists')

// Bad
it('should work')
it('test file creation')
```

### 4. Mock External Dependencies
- Mock database calls in unit tests
- Mock HTTP requests
- Mock file system operations

### 5. Test Error Scenarios
```typescript
it('should handle database connection failure', async () => {
  repository.mockImplementation(() => {
    throw new DatabaseError('Connection failed');
  });

  await expect(useCase.execute(validInput))
    .rejects.toThrow('Connection failed');
});
```

## 📚 Related Documentation

- **[Source Overview](../src/README.md)** - Architecture overview
- **[Data Layer](../src/data/README.md)** - Use case testing patterns
- **[Presentation Layer](../src/presentation/README.md)** - Controller testing
- **[Infrastructure Layer](../src/infra/README.md)** - Repository testing

---

*Comprehensive testing ensures reliability, maintainability, and confidence in the Memory Bank MCP server codebase.*
