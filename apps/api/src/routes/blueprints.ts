import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { blueprintSchema } from "@shared/schemas";
import { db } from "../db/client";
import { blueprints } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";
import { logAudit } from "../services/audit";

export const blueprintRoutes = new Hono<AuthContext>();
blueprintRoutes.use("*", requireAuth);

blueprintRoutes.patch("/:id", async (c) => {
  const auth = c.get("auth")!;
  const id = Number(c.req.param("id"));
  const input = blueprintSchema.partial().parse(await c.req.json());
  const row = await db
    .update(blueprints)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(blueprints.id, id))
    .returning()
    .get();
  await logAudit({ userId: auth.userId, action: "update", entityType: "blueprint", entityId: id, metadata: input });
  return c.json(row);
});

blueprintRoutes.delete("/:id", async (c) => {
  const auth = c.get("auth")!;
  const id = Number(c.req.param("id"));
  await db.delete(blueprints).where(eq(blueprints.id, id));
  await logAudit({ userId: auth.userId, action: "delete", entityType: "blueprint", entityId: id });
  return c.json({ success: true });
});
