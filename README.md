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

- **`MONGODB_URL`** *(required)*: MongoDB connection string (e.g., `mongodb://localhost:27017`)
- **`MONGODB_DB`** *(optional)*: MongoDB database name (defaults to `memory_bank`)

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

## Available Tools

### 📋 `list_projects`
Lists all available projects with real-time statistics.

### 📁 `list_project_files`
Lists all files within a specific project with detailed metadata.

### 📖 `memory_bank_read`
Reads the content of a specific file from a project.

### ✏️ `memory_bank_write`
Creates a new file in a project with automatic metadata enhancement.

### 🔄 `memory_bank_update`
Updates an existing file in a project with version tracking.

### 🔀 `memory_bank_merge`
Combines all files from a project into a unified document and automatically removes source files.

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

**Docker MongoDB:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
MONGODB_URL=mongodb://localhost:27017
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

*A modern, MongoDB-powered memory bank solution for AI assistants and development workflows.*
