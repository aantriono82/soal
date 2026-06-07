import { describe, expect, test } from "bun:test";
import { createViteConfig } from "./vite.config";

describe("createViteConfig", () => {
  test("uses API_PORT from env for the proxy target", () => {
    const config = createViteConfig("test", "/repo", () => ({
      API_PORT: "4321"
    }));

    expect(config.server?.proxy?.["/api"]).toMatchObject({
      target: "http://localhost:4321",
      changeOrigin: true
    });
  });

  test("falls back to port 3001 when API_PORT is missing", () => {
    const config = createViteConfig("test", "/repo", () => ({}));

    expect(config.server?.proxy?.["/api"]).toMatchObject({
      target: "http://localhost:3001"
    });
  });
});
