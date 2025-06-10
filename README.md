# Memory Bank MCP Server

> **Fork Notice:** This is a fork of the original [memory-bank-mcp](https://github.com/alioshr/memory-bank-mcp) by Aliosh Pimenta, enhanced with MongoDB-native features and real-time statistics tracking.

A modern Model Context Protocol (MCP) server implementation for MongoDB-powered memory bank management, inspired by [Cline Memory Bank](https://github.com/nickbaumann98/cline_docs/blob/main/prompting/custom%20instructions%20library/cline-memory-bank.md).

## Overview

The Memory Bank MCP Server is a MongoDB-native service that provides:

- 🗄️ **MongoDB-powered storage** with advanced indexing and search capabilities
- 🏢 **Multi-project isolation** with automatic project management
- 📊 **Real-time statistics tracking** for all projects and files
- 🔒 **Type-safe operations** with Zod validation and error handling
- 🔀 **Smart merge functionality** with automatic cleanup
- 🚀 **Optimized MCP protocol** implementation with proper JSON serialization

## Key Features

### **MongoDB-Native Architecture**
- Advanced document storage with rich metadata
- Full-text search capabilities across all files
- Automatic indexing for optimal performance
- Real-time statistics calculation and updates
- Checksums and integrity validation

### **Multi-Project Management**
- Project-specific namespaces with complete isolation
- Automatic project creation and statistics tracking
- Live project metrics (file count, total size, last updated)
- Project lifecycle management

### **Smart File Operations**
- Create, read, update files with automatic metadata enhancement
- Rich file entities with timestamps, checksums, and metadata
- Automatic statistics updates after every operation
- Enhanced merge functionality with source file cleanup

### **Advanced MCP Integration**
- Optimized JSON serialization for better tool responses
- Type-safe operations with comprehensive Zod validation
- Proper error handling with detailed error messages
- Auto-approval support for seamless AI assistant integration

## Prerequisites

Before installing the Memory Bank MCP Server, ensure you have:

- **MongoDB Server** running locally or remotely
  - MongoDB 4.4+ recommended
  - Default port: 27017
  - Can be installed via [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- **Node.js** 18+ for running the MCP server
- An MCP-compatible client (Claude Desktop, Cline, Cursor, etc.)

## Installation

### Manual Installation

1. **Clone and build the project:**
   ```bash
   git clone https://github.com/Sato-Isolated/memory-bank-mcp.git
   cd memory-bank-mcp
   pnpm install
   pnpm run build
   ```

2. **Configure your MCP client** (see Configuration section below)

## Quick Start

1. **Start MongoDB** (if not already running):
   ```bash
   # On Windows (if installed as service)
   net start MongoDB
   
   # On macOS/Linux
   mongod
   
   # Or use Docker
   docker run -d -p 27017:27017 mongo:latest
   ```

2. **Build the project:**
   ```bash
   pnpm run build
   ```

3. **Configure the MCP server** in your client settings (see Configuration section)

4. **Start using** the memory bank tools in your AI assistant

The server will automatically:
- Connect to MongoDB
- Create necessary collections and indexes
- Track statistics for all operations
- Provide real-time project and file management

## Configuration

The Memory Bank MCP Server requires MongoDB and needs to be configured in your MCP client settings.

### Environment Variables

- **`MONGODB_URL`** *(required)*: MongoDB connection string
  - Example: `mongodb://localhost:27017`
  - For remote MongoDB: `mongodb://username:password@host:port`
  - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net`

- **`MONGODB_DB`** *(required)*: MongoDB database name
  - Example: `memory_bank`
  - The database will be created automatically if it doesn't exist

### MCP Client Configuration

The server needs to be configured in your MCP client settings file:

**VS Code with MCP Extension:** Add to your VS Code settings.json:

```json
{
  "mcp": {
    "servers": {
      "memory-bank-mongo": {
        "command": "node", 
        "args": ["C:/Users/YOUR_USERNAME/path/to/memory-bank-mcp/dist/main/index.js"],
        "env": {
          "MONGODB_URL": "mongodb://localhost:27017",
          "MONGODB_DB": "memory_bank"
        }
      }
    }
  }
}
```

**Claude Desktop:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Cline Extension:** `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
**Roo Code Extension:** `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`

For other MCP clients, add the following configuration:

```json
{
  "memory-bank": {
    "command": "node",
    "args": ["/path/to/memory-bank-mcp/dist/main/index.js"],
    "env": {
      "MONGODB_URL": "mongodb://localhost:27017",
      "MONGODB_DB": "memory_bank"
    },
    "disabled": false,
    "autoApprove": [
      "memory_bank_read",
      "memory_bank_write",
      "memory_bank_update",
      "memory_bank_merge",
      "list_projects",
      "list_project_files"
    ]
  }
}
```

### Configuration for Cursor

For Cursor, open Settings → Features → Add MCP Server and add:

```shell
env MONGODB_URL=mongodb://localhost:27017 MONGODB_DB=memory_bank node /path/to/memory-bank-mcp/dist/main/index.js
```

**Important:** Replace `/path/to/memory-bank-mcp` with the actual absolute path to your cloned repository.

### Auto-Approval Settings

The `autoApprove` array contains operations that don't require explicit user approval:

- **`list_projects`**: List all projects with real-time statistics
- **`list_project_files`**: List files within a project with metadata
- **`memory_bank_read`**: Read memory bank files
- **`memory_bank_write`**: Create new memory bank files
- **`memory_bank_update`**: Update existing memory bank files
- **`memory_bank_merge`**: Merge and cleanup project files

### MongoDB Setup Examples

**Local MongoDB:**
```bash
# Default installation
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=memory_bank
```

**MongoDB with Authentication:**
```bash
MONGODB_URL=mongodb://username:password@localhost:27017
MONGODB_DB=memory_bank
```

**MongoDB Atlas (Cloud):**
```bash
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=memory_bank
```

**Docker MongoDB:**
```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Use in configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=memory_bank
```

## Available Tools

The Memory Bank MCP Server provides six core tools for AI assistants:

### 📋 `list_projects`
Lists all available projects with real-time statistics.

**Returns:**
- Project name, description, and metadata
- Live file count and total size
- Creation and last update timestamps
- Project ID and version information

### 📁 `list_project_files`
Lists all files within a specific project with detailed metadata.

**Parameters:**
- `projectName` (string): The name of the project

**Returns:**
- File names, sizes, and checksums
- Creation and modification timestamps
- MIME types and encoding information
- Rich metadata including tags and keywords

### 📖 `memory_bank_read`
Reads the content of a specific file from a project.

**Parameters:**
- `projectName` (string): The name of the project
- `fileName` (string): The name of the file

**Returns:**
- Complete file content
- File metadata and statistics
- Timestamps and checksum verification

### ✏️ `memory_bank_write`
Creates a new file in a project with automatic metadata enhancement.

**Parameters:**
- `projectName` (string): The name of the project
- `fileName` (string): The name of the file
- `content` (string): The file content

**Features:**
- Automatic project creation if needed
- Real-time statistics updates
- Rich metadata generation (MIME type, encoding, checksums)
- Timestamp tracking

### 🔄 `memory_bank_update`
Updates an existing file in a project with version tracking.

**Parameters:**
- `projectName` (string): The name of the project
- `fileName` (string): The name of the file
- `content` (string): The new file content

**Features:**
- Preserves creation timestamp
- Updates modification timestamp
- Recalculates checksums and statistics
- Automatic project statistics refresh

### 🔀 `memory_bank_merge`
**Enhanced merge functionality** - combines all files from a project into a unified document and automatically removes source files.

**Parameters:**
- `projectName` (string): The name of the project
- `format` (optional): Output format - "markdown" (default) or "plain"

**Features:**
- Creates beautifully formatted merged document
- Includes table of contents and file metadata
- Automatically deletes source files after merge
- Updates project statistics
- Returns detailed merge report with cleanup results

**Returns:**
- Merged content with rich formatting
- List of successfully deleted files
- List of failed deletions (if any)
- Merge statistics and metadata

## MongoDB Collections

The server automatically creates and manages the following MongoDB collections:

### `memory_files`
Stores all file documents with rich metadata:
- File content and metadata
- Timestamps and checksums
- Project association
- MIME types and encoding
- Search indexes for full-text search

### `projects`
Stores project information and real-time statistics:
- Project metadata and descriptions
- Live file counts and total sizes
- Creation and update timestamps
- Project lifecycle tracking

Both collections include optimized indexes for performance and search capabilities.

## Custom AI Instructions

For optimal integration with AI assistants, use the custom instructions provided in [custom-instructions.md](custom-instructions.md). These instructions help AI assistants understand how to properly use the memory bank tools for project management and file operations.

## Development

### Prerequisites for Development

- **Node.js 18+** with npm/pnpm
- **MongoDB 4.4+** running locally or remotely
- **TypeScript** knowledge for contributing

### Development Commands

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run the server locally for testing
pnpm run dev

# Run tests (109+ comprehensive tests)
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Type checking
pnpm run type-check
```

### Testing with MongoDB

The development setup includes comprehensive testing:

```bash
# Start local MongoDB for testing
mongod --dbpath ./test-db

# Run tests with MongoDB backend
MONGODB_URL=mongodb://localhost:27017 MONGODB_DB=memory_bank_test pnpm test

# Run integration tests
pnpm run test:integration
```

### Local Development Setup

1. **Clone and setup:**
   ```bash
   git clone https://github.com/Sato-Isolated/memory-bank-mcp.git
   cd memory-bank-mcp
   pnpm install
   ```

2. **Start MongoDB:**
   ```bash
   # Using Docker (recommended for development)
   docker run -d -p 27017:27017 --name mongodb-dev mongo:latest
   
   # Or start local MongoDB service
   mongod
   ```

3. **Configure environment:**
   ```bash
   # Create .env file
   echo "MONGODB_URL=mongodb://localhost:27017" > .env
   echo "MONGODB_DB=memory_bank_dev" >> .env
   ```

4. **Build and run development server:**
   ```bash
   pnpm run build
   pnpm run dev
   ```

### Testing the MCP Server

Test the server with your MCP client:

```bash
# Build and test
pnpm run build

# Run with specific environment
$env:MONGODB_URL="mongodb://localhost:27017"; $env:MONGODB_DB="memory_bank_test"; node dist/main/index.js
```

## Contributing

Contributions are welcome! The project is actively maintained and follows modern development practices.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the project guidelines
4. **Add tests** for new functionality
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- **TypeScript First**: All code must be written in TypeScript with strict type checking
- **MongoDB Native**: Utilize MongoDB features for optimal performance and functionality
- **Zod Validation**: Use Zod schemas for all input validation and type safety
- **Comprehensive Testing**: Add tests for new features (current coverage: 109+ tests)
- **Error Handling**: Implement proper error handling with meaningful messages
- **Documentation**: Update documentation for any new features or changes

### Code Style and Architecture

The project follows a clean architecture pattern:

- **Domain Layer**: Business entities and use case interfaces
- **Data Layer**: Use case implementations and repository protocols  
- **Infrastructure Layer**: MongoDB repository implementations
- **Presentation Layer**: MCP controllers and validation
- **Main Layer**: Application composition and dependency injection

### Key Technologies

- **TypeScript**: Strict type safety throughout the codebase
- **MongoDB**: Native document database with advanced indexing
- **Zod**: Runtime type validation and schema definition
- **Vitest**: Fast and comprehensive unit testing framework
- **Model Context Protocol**: Standard for AI tool integration
- **Node.js**: Runtime environment with ES modules

### Testing Philosophy

- Write unit tests for all business logic
- Include integration tests for MongoDB operations
- Test error scenarios comprehensively
- Validate type constraints with Zod schemas
- Mock external dependencies appropriately
- Maintain high test coverage (current: 109+ tests covering all functionality)

### MongoDB-Specific Guidelines

- Use MongoDB best practices for schema design
- Leverage MongoDB indexing for performance
- Implement proper error handling for database operations
- Use MongoDB aggregation pipelines for complex queries
- Follow MongoDB naming conventions for collections and fields

## Architecture Overview

### Core Components

- **MCP Protocol Layer**: Handles JSON-RPC communication with AI clients
- **Controller Layer**: Validates requests and delegates to use cases
- **Use Case Layer**: Implements business logic and orchestrates operations
- **Repository Layer**: Manages MongoDB operations and data persistence
- **Entity Layer**: Defines domain models with Zod validation

### MongoDB Schema Design

The server uses two main collections:

**`memory_files` Collection:**
- Stores file documents with rich metadata
- Indexed for optimal search and retrieval
- Includes content, checksums, and timestamps

**`projects` Collection:**
- Stores project metadata and real-time statistics
- Automatically updated with file operations
- Tracks file counts, sizes, and project lifecycle

### Data Flow

1. **MCP Request** → Controller validation
2. **Use Case** → Business logic execution
3. **Repository** → MongoDB operations
4. **Statistics Update** → Automatic project stats refresh
5. **Response** → JSON serialization back to MCP client

## Performance and Scalability

### MongoDB Advantages

- **Horizontal Scaling**: Native support for sharding and replication
- **Indexed Searches**: Optimized queries for file content and metadata
- **Real-time Statistics**: Aggregation pipelines for live project metrics
- **Document Flexibility**: Rich metadata storage without schema restrictions
- **Full-text Search**: Built-in text search across all file content

### Optimization Features

- **Automatic Indexing**: Strategic indexes for common query patterns
- **Connection Pooling**: Efficient MongoDB connection management
- **Batch Operations**: Optimized bulk operations for large projects
- **Lazy Loading**: Files and metadata loaded on demand
- **Compression**: Efficient storage of file content and metadata

## Troubleshooting

### Common Issues

**"Failed to connect to MongoDB"**
- Ensure MongoDB is running on the specified port
- Check network connectivity and firewall settings
- Verify connection string format and credentials
- For Atlas: ensure IP whitelist includes your address

**"MONGODB_URL environment variable is required"**
- Set the required environment variables in your MCP client configuration
- Verify the environment variables are properly formatted
- Check that the configuration file syntax is valid JSON

**"Collection operation failed"**
- Ensure adequate disk space for MongoDB operations
- Check MongoDB logs for detailed error information
- Verify database permissions and access rights
- Consider increasing MongoDB memory allocation

**Tools not appearing in AI client**
- Restart your AI client after configuration changes
- Verify MCP server configuration syntax
- Check that the package is properly installed
- Review client logs for connection errors

### Debug Mode

Enable detailed logging by setting:
```bash
export DEBUG=memory-bank-mcp:*
export MONGODB_URL=mongodb://localhost:27017
export MONGODB_DB=memory_bank_debug
```

### Health Checks

Test MongoDB connectivity:
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017" --eval "db.runCommand({ping: 1})"

# Test MCP server
$env:MONGODB_URL="mongodb://localhost:27017"; $env:MONGODB_DB="test"; node /path/to/memory-bank-mcp/dist/main/index.js
```

## Migration Guide

### From File System to MongoDB

If upgrading from a file system-based memory bank:

1. **Export existing data** from file system storage
2. **Set up MongoDB** with proper connection configuration
3. **Use import tools** to migrate files to MongoDB collections
4. **Update MCP configuration** to use MongoDB environment variables
5. **Test functionality** with migrated data

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[Original Memory Bank MCP](https://github.com/alioshr/memory-bank-mcp)**: Original project by Aliosh Pimenta that this fork is based on
- **[Cline Memory Bank](https://github.com/nickbaumann98/cline_docs/blob/main/prompting/custom%20instructions%20library/cline-memory-bank.md)**: Original inspiration for the memory bank concept
- **[Model Context Protocol](https://github.com/modelcontextprotocol/spec)**: Standard for AI tool integration
- **MongoDB Community**: For providing excellent documentation and tools
- **TypeScript Team**: For enabling type-safe development
- **Contributors**: All developers who have contributed to this project

---

**Built with ❤️ for the AI development community**

*A modern, MongoDB-powered memory bank solution for AI assistants and development workflows.*
