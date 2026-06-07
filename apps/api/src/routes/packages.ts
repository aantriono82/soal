import { Hono } from "hono";
import { and, desc, eq, inArray } from "drizzle-orm";
import { packageSchema } from "@shared/schemas";
import { db } from "../db/client";
import { packageQuestions, questionPackages, questionOptions, questions } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";
import { logAudit } from "../services/audit";

export const packageRoutes = new Hono<AuthContext>();
packageRoutes.use("*", requireAuth);

async function hydratePackage(id: number) {
  const pack = await db.select().from(questionPackages).where(eq(questionPackages.id, id)).get();
  if (!pack) return null;
  const links = await db.select().from(packageQuestions).where(eq(packageQuestions.packageId, id)).orderBy(packageQuestions.orderNumber);
  const questionIds = links.map((link) => link.questionId);
  const qs = questionIds.length ? await db.select().from(questions).where(inArray(questions.id, questionIds)) : [];
  const opts = questionIds.length ? await db.select().from(questionOptions).where(inArray(questionOptions.questionId, questionIds)) : [];
  return {
    ...pack,
    questions: qs.map((question) => ({
      ...question,
      options: opts.filter((option) => option.questionId === question.id),
      packageMeta: links.find((link) => link.questionId === question.id)
    }))
  };
}

packageRoutes.get("/", async (c) => {
  const rows = await db.select().from(questionPackages).orderBy(desc(questionPackages.id));
  return c.json(rows);
});

packageRoutes.post("/", async (c) => {
  const auth = c.get("auth")!;
  const input = packageSchema.parse(await c.req.json());
  const pack = await db
    .insert(questionPackages)
    .values({
      title: input.title,
      assessmentId: input.assessmentId ?? null,
      description: input.description,
      createdBy: auth.userId
    })
    .returning()
    .get();

  if (input.questionIds.length) {
    await db.insert(packageQuestions).values(
      input.questionIds.map((questionId, index) => ({
        packageId: pack.id,
        questionId,
        orderNumber: index + 1,
        scoreWeight: 1
      }))
    );
  }

  await logAudit({ userId: auth.userId, action: "create", entityType: "package", entityId: pack.id });
  return c.json(await hydratePackage(pack.id), 201);
});

packageRoutes.get("/:id", async (c) => {
  const item = await hydratePackage(Number(c.req.param("id")));
  if (!item) {
    return c.json({ message: "Paket tidak ditemukan" }, 404);
  }
  return c.json(item);
});

packageRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const input = packageSchema.partial().parse(await c.req.json());
  const pack = await db
    .update(questionPackages)
    .set({
      title: input.title,
      description: input.description,
      assessmentId: input.assessmentId ?? undefined,
      updatedAt: new Date().toISOString()
    })
    .where(eq(questionPackages.id, id))
    .returning()
    .get();

  if (input.questionIds) {
    await db.delete(packageQuestions).where(eq(packageQuestions.packageId, id));
    if (input.questionIds.length) {
      await db.insert(packageQuestions).values(
        input.questionIds.map((questionId, index) => ({
          packageId: id,
          questionId,
          orderNumber: index + 1,
          scoreWeight: 1
        }))
      );
    }
  }

  return c.json(pack ? await hydratePackage(id) : null);
});

packageRoutes.delete("/:id", async (c) => {
  await db.delete(questionPackages).where(eq(questionPackages.id, Number(c.req.param("id"))));
  return c.json({ success: true });
});

packageRoutes.post("/:id/questions", async (c) => {
  const id = Number(c.req.param("id"));
  const { questionId } = await c.req.json();
  const existing = await db.select().from(packageQuestions).where(eq(packageQuestions.packageId, id));
  const link = await db
    .insert(packageQuestions)
    .values({
      packageId: id,
      questionId: Number(questionId),
      orderNumber: existing.length + 1,
      scoreWeight: 1
    })
    .returning()
    .get();
  return c.json(link, 201);
});

packageRoutes.delete("/:id/questions/:questionId", async (c) => {
  const id = Number(c.req.param("id"));
  const questionId = Number(c.req.param("questionId"));
  await db.delete(packageQuestions).where(and(eq(packageQuestions.packageId, id), eq(packageQuestions.questionId, questionId)));
  const remaining = await db.select().from(packageQuestions).where(eq(packageQuestions.packageId, id)).orderBy(packageQuestions.orderNumber);
  for (const [index, item] of remaining.entries()) {
    await db.update(packageQuestions).set({ orderNumber: index + 1 }).where(eq(packageQuestions.id, item.id));
  }
  return c.json({ success: true });
});
