#!/usr/bin/env node

import createApp from "./protocols/mcp/app.js";

async function start() {
  const app = await createApp();
  await app.start();
}

start().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
