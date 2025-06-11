# Memory Bank MCP Server

> **Fork Notice:** This is a fork of the original [memory-bank-mcp](https://github.com/alioshr/memory-bank-mcp) by Aliosh Pimenta, enhanced with MongoDB-native features and real-time statistics tracking.

A modern Model Context Protocol (MCP) server implementation for MongoDB-powered memory bank management.

## Key Features

- 🗄️ **MongoDB-powered storage** with advanced indexing and search capabilities
- 🏢 **Multi-project isolation** with automatic project management
- 📊 **Real-time statistics tracking** for all projects and files
- 🔒 **Type-safe operations** with Zod validation and error handling
- 🔀 **Smart merge functionality** with automatic cleanup
- 🚀 **Optimized MCP protocol** implementation

## Prerequisites

- **MongoDB Server** running locally or remotely (MongoDB 4.4+ recommended)
- **Node.js** 18+ for running the MCP server
- An MCP-compatible client (Claude Desktop, Cline, Cursor, etc.)

## Installation

### NPM Installation (Recommended)

```bash
npm install -g memory-bank-mcp-mongodb
```

### Manual Installation

```bash
git clone https://github.com/Sato-Isolated/memory-mongo-bank-mcp.git
cd memory-mongo-bank-mcp
pnpm install
pnpm run build
```

## Quick Start

1. **Start MongoDB:**

   ```bash
   # Windows (if installed as service)
   net start MongoDB

   # macOS/Linux
   mongod

   # Or use Docker
   docker run -d -p 27017:27017 mongo:latest
   ```

2. **Configure your MCP client** (see Configuration section below)

## Configuration

### Environment Variables

- **`MONGODB_URL`** _(required)_: MongoDB connection string (e.g., `mongodb://localhost:27017`)
- **`MONGODB_DB`** _(optional)_: MongoDB database name (defaults to `memory_bank`)

### MCP Client Configuration

**VS Code with MCP Extension:**

```json
{
  "mcp": {
    "servers": {
      "memory-bank-mongo": {
        "command": "npx",
        "args": ["-y", "memory-bank-mcp-mongodb"],
        "env": {
          "MONGODB_URL": "mongodb://localhost:27017",
          "MONGODB_DB": "memory_bank"
        }
      }
    }
  }
}
```

**Claude Desktop, Cline, Cursor:**

```json
{
  "memory-bank": {
    "command": "npx",
    "args": ["-y", "memory-bank-mcp-mongodb"],
    "env": {
      "MONGODB_URL": "mongodb://localhost:27017",
      "MONGODB_DB": "memory_bank"
    }
  }
}
```

**Cursor (Alternative):**

```shell
env MONGODB_URL=mongodb://localhost:27017 MONGODB_DB=memory_bank npx -y memory-bank-mcp-mongodb
```

## Documentation

This project uses distributed documentation to help you navigate different sections:

### 📚 **Architecture & Code Structure**

- **[Source Code Overview](src/README.md)** - Architecture patterns and project structure
- **[Domain Layer](src/domain/README.md)** - Business entities and core logic
- **[Data Layer](src/data/README.md)** - Repository patterns and use cases
- **[Presentation Layer](src/presentation/README.md)** - Controllers and API endpoints
- **[Infrastructure](src/infra/README.md)** - Database and external services

## Available Tools

### 🎯 **Priority Tools (Start Here)**

#### 📋 `list_projects`
**[PRIORITY 1 - START HERE]** List all projects in the memory bank. ALWAYS use this first to discover available projects before any other operation. Essential for understanding workspace structure.

#### 📁 `list_project_files`
**[PRIORITY 2 - EXPLORE]** List all files within a specific project. Use after `list_projects` to discover what files exist before reading them. Critical for understanding project content.

#### 📖 `memory_bank_read`
**[PRIORITY 3 - READ]** Read a memory bank file for a specific project. Primary method to access file content. Use after `list_project_files` to read specific files.

#### 🔍 `memory_bank_search`
**[HIGH PRIORITY - SEARCH]** Search for files containing specific text within a project. Essential for finding relevant files when you don't know exact filenames.

### 📝 **File Management Tools**

#### ✏️ `memory_bank_write`
**[CREATE NEW]** Create a new memory bank file for a specific project. Use when you need to create brand new files.

#### 🔄 `memory_bank_update`
**[MODIFY EXISTING]** Update an existing memory bank file for a specific project. Automatically creates version history.

#### 🔀 `memory_bank_merge`
**[COMPREHENSIVE VIEW]** Merge all files from a project into a single formatted document. Excellent for understanding full project context.

#### 🏷️ `memory_bank_get_files_by_tags`
**[SMART FILTER]** Find files in a project by their tags. Helpful when you know the type of content you're looking for but not exact filenames.

#### 📊 `memory_bank_get_project_stats`
**[PROJECT OVERVIEW]** Get statistics for a project including file count and total size. Use to understand project scope and scale.

### 🗑️ **Deletion Tools (Use with Caution)**

#### 🗑️ `memory_bank_delete_file`
**[CAREFUL - DELETE FILE]** Delete a specific file from a project. ⚠️ WARNING: This action is permanent and cannot be undone.

#### 💥 `memory_bank_delete_project`
**[DANGER - DELETE PROJECT]** Delete an entire project and all its files. ⚠️ EXTREME CAUTION: This action is permanent and cannot be undone.

### 📚 **Version Control Tools**

#### 📚 `memory_bank_version_history`
**[VERSION HISTORY]** Get complete version history for a specific file. Shows all previous versions with metadata and timestamps.

#### 📄 `memory_bank_read_version`
**[READ SPECIFIC VERSION]** Read the content of a specific file version. Use to view historical content of a particular version.

#### ⏪ `memory_bank_revert_file_to_version`
**[RESTORE PREVIOUS VERSION]** Restore a file to a previous version. Creates a new version with the old content for safety.

#### 🔍 `memory_bank_compare_versions`
**[COMPARE VERSIONS]** Compare two versions of a file to see differences. Use to understand what changed between versions.

#### 🧹 `memory_bank_cleanup_old_versions`
**[MAINTENANCE]** Clean up old file versions to save storage space. Keeps recent versions and removes older ones.

### 🚀 **Project Template Tools**

#### 📋 `memory_bank_get_project_templates`
**[TEMPLATE DISCOVERY]** List available project templates. Essential when starting new projects from predefined structures.

#### 🚀 `memory_bank_create_project_from_template`
**[RAPID PROJECT CREATION]** Create a new project using a template. Fastest way to start structured projects.

#### ⚡ `memory_bank_install_predefined_templates`
**[FIRST-TIME SETUP]** Install built-in project templates. Run this ONCE when first using the system to add default templates.

## MongoDB Setup Examples

**Local MongoDB:**

```bash
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=memory_bank
```

**MongoDB Atlas (Cloud):**

```bash
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=memory_bank
```

## Troubleshooting

**"Failed to connect to MongoDB"**

- Ensure MongoDB is running on the specified port
- Check network connectivity and firewall settings
- Verify connection string format and credentials

**"MONGODB_URL environment variable is required"**

- Set the required environment variables in your MCP client configuration
- Verify the environment variables are properly formatted

**Tools not appearing in AI client**

- Restart your AI client after configuration changes
- Check that the package is properly installed
- Review client logs for connection errors

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **NPM Package**: https://www.npmjs.com/package/memory-bank-mcp-mongodb
- **GitHub Repository**: https://github.com/Sato-Isolated/memory-mongo-bank-mcp
- **Original Project**: https://github.com/alioshr/memory-bank-mcp

---

_A modern, MongoDB-powered memory bank solution for AI assistants and development workflows._
