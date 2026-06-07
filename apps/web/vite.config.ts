import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export function createViteConfig(
  mode: string,
  rootDir = process.cwd(),
  envLoader: typeof loadEnv = loadEnv
) {
  const env = envLoader(mode, rootDir, "");
  const apiPort = Number(env.API_PORT ?? 3001);

  return {
    root: path.resolve(__dirname),
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "../../packages/shared")
      }
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: "dist",
      emptyOutDir: true
    }
  };
}

export default defineConfig(({ mode }) => createViteConfig(mode));
