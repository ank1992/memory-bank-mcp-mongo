import {
  makeListProjectFilesController,
  makeListProjectsController,
  makeMergeFilesController,
  makeReadController,
  makeSearchProjectFilesController,
  makeUpdateController,
  makeWriteController,
  makeGetFilesByTagsController,
  makeGetProjectStatsController,
  makeDeleteFileController,
  makeDeleteProjectController,
  makeGetFileVersionsController,
  makeGetFileVersionController,
  makeRevertFileToVersionController,
  makeCompareFileVersionsController,
  makeCleanupOldVersionsController,
  makeGetProjectTemplatesController,
  makeCreateProjectFromTemplateController,
  makeInstallPredefinedTemplatesController,
} from "../../factories/controllers/index.js";
import { adaptMcpRequestHandler } from "./adapters/mcp-request-adapter.js";
import { McpRouterAdapter } from "./adapters/mcp-router-adapter.js";

export default () => {
  const router = new McpRouterAdapter();  router.setTool({
    schema: {
      name: "list_projects",
      description:
        "🔍 [PRIORITY 1 - START HERE] List all projects in the memory bank. ALWAYS use this first to discover available projects before any other operation. Essential for understanding workspace structure.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handler: adaptMcpRequestHandler(makeListProjectsController()),
  });  router.setTool({
    schema: {
      name: "list_project_files",
      description:
        "📂 [PRIORITY 2 - EXPLORE] List all files within a specific project. Use after list_projects to discover what files exist before reading them. Critical for understanding project content.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
        },
        required: ["projectName"],
      },
    },
    handler: adaptMcpRequestHandler(makeListProjectFilesController()),
  });  router.setTool({
    schema: {
      name: "memory_bank_read",
      description:
        "📖 [PRIORITY 3 - READ] Read a memory bank file for a specific project. Primary method to access file content. Use after list_project_files to read specific files. Returns file content with helpful project context.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
        },
        required: ["projectName", "fileName"],
      },    },
    handler: adaptMcpRequestHandler(makeReadController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_search",
      description:
        "🔍 [HIGH PRIORITY - SEARCH] Search for files containing specific text within a project. Essential for finding relevant files when you don't know exact filenames. Use when looking for content or keywords across project files.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          query: {
            type: "string",
            description: "The search query to find in file contents and names",
          },
        },
        required: ["projectName", "query"],
      },
    },
    handler: adaptMcpRequestHandler(makeSearchProjectFilesController()),
  });  router.setTool({
    schema: {
      name: "memory_bank_write",
      description:
        "✍️ [CREATE NEW] Create a new memory bank file for a specific project. Use when you need to create brand new files. Automatically checks if file already exists and provides helpful context about project state.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
          content: {
            type: "string",
            description: "The content of the file",
          },
        },
        required: ["projectName", "fileName", "content"],
      },
    },
    handler: adaptMcpRequestHandler(makeWriteController()),
  });  router.setTool({
    schema: {
      name: "memory_bank_update",
      description:
        "📝 [MODIFY EXISTING] Update an existing memory bank file for a specific project. Use this to modify files that already exist. Automatically creates version history. Verifies file exists before updating and provides context about changes.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
          content: {
            type: "string",
            description: "The content of the file",
          },
        },
        required: ["projectName", "fileName", "content"],
      },
    },
    handler: adaptMcpRequestHandler(makeUpdateController()),
  });  router.setTool({
    schema: {
      name: "memory_bank_merge",
      description:
        "🔗 [COMPREHENSIVE VIEW] Merge all files from a project into a single formatted document. Use after reading individual files to get a complete overview of entire project content. Excellent for understanding full project context.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          format: {
            type: "string",
            description: "Output format: 'markdown' or 'plain'",
            enum: ["markdown", "plain"],
          },
        },        required: ["projectName"],
      },
    },
    handler: adaptMcpRequestHandler(makeMergeFilesController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_get_files_by_tags",
      description:
        "🏷️ [SMART FILTER] Find files in a project by their tags. Use to discover files with specific labels or categories. Helpful when you know the type of content you're looking for but not exact filenames.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          tags: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Array of tags to filter by",
          },
        },
        required: ["projectName", "tags"],
      },
    },
    handler: adaptMcpRequestHandler(makeGetFilesByTagsController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_get_project_stats",
      description:
        "📊 [PROJECT OVERVIEW] Get statistics for a project including file count and total size. Use to understand project scope and scale before diving into details.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
        },
        required: ["projectName"],
      },
    },
    handler: adaptMcpRequestHandler(makeGetProjectStatsController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_delete_file",
      description:
        "🗑️ [CAREFUL - DELETE FILE] Delete a specific file from a project. ⚠️ WARNING: This action is permanent and cannot be undone. Use only when absolutely certain.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          filePath: {
            type: "string",
            description: "The path of the file to delete",
          },
        },
        required: ["projectName", "filePath"],
      },
    },
    handler: adaptMcpRequestHandler(makeDeleteFileController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_delete_project",
      description:
        "💥 [DANGER - DELETE PROJECT] Delete an entire project and all its files. ⚠️ EXTREME CAUTION: This action is permanent and cannot be undone. Use only when absolutely certain you want to destroy all project data.",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the project to delete",
          },
        },
        required: ["name"],
      },
    },
    handler: adaptMcpRequestHandler(makeDeleteProjectController()),
  });  // File Versioning Routes
  router.setTool({
    schema: {
      name: "memory_bank_version_history",
      description:
        "📚 [VERSION HISTORY] Get complete version history for a specific file. Shows all previous versions with metadata and timestamps. Use when you need to see how a file has evolved over time.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
        },
        required: ["projectName", "fileName"],
      },
    },
    handler: adaptMcpRequestHandler(makeGetFileVersionsController()),
  });  router.setTool({
    schema: {
      name: "memory_bank_read_version",
      description:
        "📄 [READ SPECIFIC VERSION] Read the content of a specific file version. Use to view historical content of a particular version. Requires knowing the version number from version_history.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
          version: {
            type: "number",
            description: "The version number to retrieve",
          },
        },
        required: ["projectName", "fileName", "version"],
      },
    },
    handler: adaptMcpRequestHandler(makeGetFileVersionController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_revert_file_to_version",
      description:
        "⏪ [RESTORE PREVIOUS VERSION] Restore a file to a previous version. Creates a new version with the old content. ⚠️ IMPORTANT: This cannot be undone but creates a new version for safety.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
          version: {
            type: "number",
            description: "The version number to revert to",
          },
        },
        required: ["projectName", "fileName", "version"],
      },    },
    handler: adaptMcpRequestHandler(makeRevertFileToVersionController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_compare_versions",
      description:
        "🔍 [COMPARE VERSIONS] Compare two versions of a file to see differences. Use to understand what changed between versions. Requires knowing version numbers from version_history.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
          version1: {
            type: "number",
            description: "The first version number to compare",
          },
          version2: {
            type: "number",
            description: "The second version number to compare",
          },
        },
        required: ["projectName", "fileName", "version1", "version2"],
      },    },
    handler: adaptMcpRequestHandler(makeCompareFileVersionsController()),
  });

  router.setTool({
    schema: {
      name: "memory_bank_cleanup_old_versions",
      description:
        "🧹 [MAINTENANCE] Clean up old file versions to save storage space. Keeps recent versions and removes older ones. Use periodically for maintenance. Default keeps 10 versions per file.",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          maxVersionsPerFile: {
            type: "number",
            description: "Maximum versions to keep per file (default: 10)",
          },
        },
        required: ["projectName"],
      },
    },
    handler: adaptMcpRequestHandler(makeCleanupOldVersionsController()),
  });

  // Project Template Routes
  router.setTool({
    schema: {
      name: "memory_bank_get_project_templates",
      description:
        "📋 [TEMPLATE DISCOVERY] List available project templates. Use to find templates for quick project creation. Essential when starting new projects from predefined structures.",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Filter templates by category (optional)",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Filter templates by tags (optional)",
          },
        },
        required: [],
      },
    },
    handler: adaptMcpRequestHandler(makeGetProjectTemplatesController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_create_project_from_template",
      description:
        "🚀 [RAPID PROJECT CREATION] Create a new project using a template. Automatically creates files with variable substitution. Use after get_project_templates to choose a template. Fastest way to start structured projects.",
      inputSchema: {
        type: "object",
        properties: {
          templateId: {
            type: "string",
            description: "The ID of the template to use",
          },
          projectName: {
            type: "string",
            description: "The name of the new project",
          },
          variables: {
            type: "object",
            description: "Variable values for template substitution (optional)",
            additionalProperties: true,
          },
        },
        required: ["templateId", "projectName"],
      },
    },
    handler: adaptMcpRequestHandler(makeCreateProjectFromTemplateController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_install_predefined_templates",
      description:
        "⚡ [FIRST-TIME SETUP] Install built-in project templates. Run this ONCE when first using the system to add default templates for notes, journals, and project planning. Essential for template functionality.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handler: adaptMcpRequestHandler(makeInstallPredefinedTemplatesController()),
  });

  return router;
};
