import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { loginSchema, registerSchema } from "@shared/schemas";
import { db } from "../db/client";
import { users } from "../db/schema";
import type { AuthContext } from "../middlewares/auth";
import { requireAuth, setAuthCookie } from "../middlewares/auth";
import { signToken } from "../lib/jwt";

export const authRoutes = new Hono<AuthContext>();

authRoutes.post("/register", async (c) => {
  const input = registerSchema.parse(await c.req.json());
  const existing = await db.select().from(users).where(eq(users.email, input.email)).get();
  if (existing) {
    return c.json({ message: "Email sudah terdaftar" }, 409);
  }

  const passwordHash = await Bun.password.hash(input.password);
  const result = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role
    })
    .returning()
    .get();

  const token = await signToken({ userId: result.id, role: result.role });
  setAuthCookie(c, token);

  return c.json({
    user: {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role
    }
  });
});

authRoutes.post("/login", async (c) => {
  const input = loginSchema.parse(await c.req.json());
  const user = await db.select().from(users).where(eq(users.email, input.email)).get();

  if (!user || !(await Bun.password.verify(input.password, user.passwordHash))) {
    return c.json({ message: "Email atau password salah" }, 401);
  }

  const token = await signToken({ userId: user.id, role: user.role });
  setAuthCookie(c, token);

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

authRoutes.get("/me", requireAuth, async (c) => {
  const auth = c.get("auth");
  const user = await db.select().from(users).where(eq(users.id, auth!.userId)).get();
  if (!user) {
    return c.json({ message: "User tidak ditemukan" }, 404);
  }

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    }
  });
});

authRoutes.post("/logout", async (c) => {
  deleteCookie(c, "token", { path: "/" });
  return c.json({ success: true });
});

authRoutes.post("/reset-password", requireAuth, async (c) => {
  const { password } = await c.req.json();
  if (!password || password.length < 6) {
    return c.json({ message: "Password minimal 6 karakter" }, 400);
  }

  const auth = c.get("auth");
  const passwordHash = await Bun.password.hash(password);
  await db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.id, auth!.userId));
  return c.json({ success: true });
});
