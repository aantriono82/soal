import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { assessmentSchema, blueprintSchema } from "@shared/schemas";
import { db } from "../db/client";
import { assessments, blueprints } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";
import { logAudit } from "../services/audit";

export const assessmentRoutes = new Hono<AuthContext>();

assessmentRoutes.use("*", requireAuth);

assessmentRoutes.get("/", async (c) => {
  const auth = c.get("auth")!;
  const rows = await db
    .select()
    .from(assessments)
    .where(auth.role === "admin" ? undefined : eq(assessments.createdBy, auth.userId))
    .orderBy(desc(assessments.id));
  return c.json(rows);
});

assessmentRoutes.post("/", async (c) => {
  const auth = c.get("auth")!;
  const input = assessmentSchema.parse(await c.req.json());
  const row = await db.insert(assessments).values({ ...input, createdBy: auth.userId }).returning().get();
  await logAudit({ userId: auth.userId, action: "create", entityType: "assessment", entityId: row.id, metadata: row });
  return c.json(row, 201);
});

assessmentRoutes.get("/:id", async (c) => {
  const row = await db.select().from(assessments).where(eq(assessments.id, Number(c.req.param("id")))).get();
  if (!row) {
    return c.json({ message: "Asesmen tidak ditemukan" }, 404);
  }
  return c.json(row);
});

assessmentRoutes.patch("/:id", async (c) => {
  const auth = c.get("auth")!;
  const id = Number(c.req.param("id"));
  const input = assessmentSchema.partial().parse(await c.req.json());
  const row = await db
    .update(assessments)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(assessments.id, id))
    .returning()
    .get();
  await logAudit({ userId: auth.userId, action: "update", entityType: "assessment", entityId: id, metadata: input });
  return c.json(row);
});

assessmentRoutes.delete("/:id", async (c) => {
  const auth = c.get("auth")!;
  const id = Number(c.req.param("id"));
  await db.delete(assessments).where(eq(assessments.id, id));
  await logAudit({ userId: auth.userId, action: "delete", entityType: "assessment", entityId: id });
  return c.json({ success: true });
});

assessmentRoutes.get("/:id/blueprints", async (c) => {
  const assessmentId = Number(c.req.param("id"));
  const rows = await db.select().from(blueprints).where(eq(blueprints.assessmentId, assessmentId)).orderBy(blueprints.id);
  return c.json(rows);
});

assessmentRoutes.post("/:id/blueprints", async (c) => {
  const auth = c.get("auth")!;
  const assessmentId = Number(c.req.param("id"));
  const input = blueprintSchema.parse({ ...(await c.req.json()), assessmentId });
  const row = await db.insert(blueprints).values(input).returning().get();
  await logAudit({ userId: auth.userId, action: "create", entityType: "blueprint", entityId: row.id, metadata: row });
  return c.json(row, 201);
});
