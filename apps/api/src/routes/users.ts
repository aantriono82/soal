import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";

export const userRoutes = new Hono<AuthContext>();

userRoutes.use("*", requireAuth, requireRole(["admin"]));

userRoutes.get("/", async (c) => {
  const data = await db.select().from(users);
  return c.json(data.map(({ passwordHash, ...item }) => item));
});

userRoutes.get("/:id", async (c) => {
  const item = await db.select().from(users).where(eq(users.id, Number(c.req.param("id")))).get();
  if (!item) {
    return c.json({ message: "User tidak ditemukan" }, 404);
  }
  const { passwordHash, ...safeUser } = item;
  return c.json(safeUser);
});

userRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const updated = await db
    .update(users)
    .set({
      name: body.name,
      role: body.role,
      avatarUrl: body.avatarUrl,
      updatedAt: new Date().toISOString()
    })
    .where(eq(users.id, id))
    .returning()
    .get();

  return c.json(updated);
});

userRoutes.delete("/:id", async (c) => {
  await db.delete(users).where(eq(users.id, Number(c.req.param("id"))));
  return c.json({ success: true });
});
