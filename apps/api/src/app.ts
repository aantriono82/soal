import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "./lib/env";
import { authMiddleware } from "./middlewares/auth";
import { aiRoutes } from "./routes/ai";
import { assessmentRoutes } from "./routes/assessments";
import { authRoutes } from "./routes/auth";
import { blueprintRoutes } from "./routes/blueprints";
import { dashboardRoutes } from "./routes/dashboard";
import { exportRoutes } from "./routes/export";
import { mediaRoutes } from "./routes/media";
import { packageRoutes } from "./routes/packages";
import { questionRoutes } from "./routes/questions";
import { userRoutes } from "./routes/users";

export type AppConfig = Pick<typeof env, "appName" | "appUrl" | "uploadDir">;

export function createApp(config: AppConfig = env) {
  const app = new Hono();

  app.use("*", logger(), cors({ origin: config.appUrl, credentials: true }), authMiddleware);

  app.get("/", (c) => c.json({ name: config.appName, status: "ok" }));
  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/api/auth", authRoutes);
  app.route("/api/dashboard", dashboardRoutes);
  app.route("/api/users", userRoutes);
  app.route("/api/assessments", assessmentRoutes);
  app.route("/api/blueprints", blueprintRoutes);
  app.route("/api/questions", questionRoutes);
  app.route("/api/media", mediaRoutes);
  app.route("/api/packages", packageRoutes);
  app.route("/api/ai", aiRoutes);
  app.route("/api/export", exportRoutes);

  app.get("/api/media/file/:key", async (c) => {
    const filePath = path.resolve(config.uploadDir, c.req.param("key"));
    const buffer = await readFile(filePath);
    return c.body(buffer);
  });

  return app;
}
