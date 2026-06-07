import { serve } from "@hono/node-server";
import { runMigrations } from "./db/client";
import { createApp } from "./app";
import { env } from "./lib/env";

runMigrations();

const app = createApp();

serve({
  fetch: app.fetch,
  port: env.apiPort
});

console.log(`API berjalan di http://localhost:${env.apiPort}`);
