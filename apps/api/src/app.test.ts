import { describe, expect, test } from "bun:test";
import { createApp } from "./app";

describe("createApp", () => {
  test("applies CORS origin from appUrl", async () => {
    const app = createApp({
      appName: "Assessment AI App",
      appUrl: "http://localhost:3002",
      uploadDir: "./uploads"
    });

    const response = await app.request("http://localhost/health", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3002",
        "Access-Control-Request-Method": "GET"
      }
    });

    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3002");
    expect(response.headers.get("access-control-allow-credentials")).toBe("true");
  });
});
