import { createMiddleware } from "hono/factory";
import type { AuthContext } from "./auth";

export function requireRole(roles: string[]) {
  return createMiddleware<AuthContext>(async (c, next) => {
    const auth = c.get("auth");
    if (!auth || !roles.includes(auth.role)) {
      return c.json({ message: "Forbidden" }, 403);
    }
    await next();
  });
}
