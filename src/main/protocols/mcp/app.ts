import { McpServerAdapter } from "./adapters/mcp-server-adapter.js";
import routes from "./routes.js";
import { repositoriesService } from "../../factories/repositories/repositories-factory.js";

async function createApp() {
  // Initialize repositories first
  await repositoriesService.initialize();
  
  // Then create routes
  const router = routes();
  const app = new McpServerAdapter(router);

  app.register({
    name: "memory-bank",
    version: "1.0.0",
  });

  return app;
}

export default createApp;
