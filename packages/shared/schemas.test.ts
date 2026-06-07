import { describe, expect, test } from "bun:test";
import { registerSchema } from "./schemas";

describe("registerSchema", () => {
  test("accepts only admin and guru roles", () => {
    const base = {
      name: "Demo User",
      email: "demo@example.com",
      password: "secret123"
    };

    expect(registerSchema.parse({ ...base, role: "admin" }).role).toBe("admin");
    expect(registerSchema.parse({ ...base, role: "guru" }).role).toBe("guru");
    expect(() => registerSchema.parse({ ...base, role: "operator" })).toThrow();
  });
});
