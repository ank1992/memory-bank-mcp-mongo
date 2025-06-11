import {
  makeListProjectFilesController,
  makeListProjectsController,
  makeMergeFilesController,
  makeReadController,
  makeUpdateController,
  makeWriteController,
} from "../../factories/controllers/index.js";
import { adaptMcpRequestHandler } from "./adapters/mcp-request-adapter.js";
import { McpRouterAdapter } from "./adapters/mcp-router-adapter.js";

export default () => {
  const router = new McpRouterAdapter();
  router.setTool({
    schema: {
      name: "list_projects",
      description:
        "🔍 [START HERE] List all projects in the memory bank. Use this first to explore available projects before reading or writing files.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handler: adaptMcpRequestHandler(makeListProjectsController()),
  });
  router.setTool({
    schema: {
      name: "list_project_files",
      description:
        "📂 [EXPLORE] List all files within a specific project. Use after list_projects to see what files exist before reading them.",
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
  });
  router.setTool({
    schema: {
      name: "memory_bank_read",
      description:
        "📖 [READ] Read a memory bank file for a specific project. Returns file content with context about the project structure.",
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
    handler: adaptMcpRequestHandler(makeReadController()),
  });
  router.setTool({
    schema: {
      name: "memory_bank_write",
      description:
        "✍️ [CREATE] Create a new memory bank file for a specific project. Automatically checks if file already exists and provides helpful context about project state.",
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
  });
  router.setTool({
    schema: {
      name: "memory_bank_update",
      description:
        "📝 [MODIFY] Update an existing memory bank file for a specific project. Verifies file exists before updating and provides context about changes.",
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
  });
  router.setTool({
    schema: {
      name: "memory_bank_merge",
      description:
        "🔗 [FUSION] Merge all files from a project into a single formatted document. Use after reading individual files to get a complete overview.",
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
        },
        required: ["projectName"],
      },
    },
    handler: adaptMcpRequestHandler(makeMergeFilesController()),
  });

  return router;
};
