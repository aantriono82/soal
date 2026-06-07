import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { AuthPayload } from "../lib/jwt";
import { signToken, verifyToken } from "../lib/jwt";

export type AuthContext = {
  Variables: {
    auth: AuthPayload | null;
  };
};

export const authMiddleware = createMiddleware<AuthContext>(async (c, next) => {
  const token = getCookie(c, "token");
  if (!token) {
    c.set("auth", null);
    return next();
  }

  try {
    const payload = await verifyToken(token);
    c.set("auth", payload);
  } catch {
    deleteCookie(c, "token");
    c.set("auth", null);
  }

  await next();
});

export const requireAuth = createMiddleware<AuthContext>(async (c, next) => {
  const auth = c.get("auth");
  if (!auth) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  await next();
});

export function setAuthCookie(c: Parameters<typeof setCookie>[0], token: string) {
  setCookie(c, "token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7
  });
}
