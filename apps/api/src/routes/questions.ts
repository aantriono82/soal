import { Hono } from "hono";
import { and, desc, eq, inArray, like, sql, type SQL } from "drizzle-orm";
import { questionSchema } from "@shared/schemas";
import { db } from "../db/client";
import { questionOptions, questions } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";
import { logAudit } from "../services/audit";

export const questionRoutes = new Hono<AuthContext>();
questionRoutes.use("*", requireAuth);

async function withOptions(questionId: number) {
  const item = await db.select().from(questions).where(eq(questions.id, questionId)).get();
  if (!item) {
    return null;
  }
  const options = await db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId));
  return { ...item, options };
}

questionRoutes.get("/", async (c) => {
  const params = c.req.query();
  const filters: SQL[] = [];
  if (params.subject) filters.push(eq(questions.subject, params.subject));
  if (params.grade) filters.push(eq(questions.grade, params.grade));
  if (params.material) filters.push(like(questions.material, `%${params.material}%`));
  if (params.questionType) filters.push(eq(questions.questionType, params.questionType));
  if (params.difficulty) filters.push(eq(questions.difficulty, params.difficulty));
  if (params.status) filters.push(eq(questions.status, params.status));

  const rows = await db
    .select()
    .from(questions)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(questions.id));

  const ids = rows.map((row) => row.id);
  const options = ids.length ? await db.select().from(questionOptions).where(inArray(questionOptions.questionId, ids)) : [];
  const grouped = new Map<number, typeof options>();
  for (const option of options) {
    const existing = grouped.get(option.questionId) ?? [];
    existing.push(option);
    grouped.set(option.questionId, existing);
  }

  return c.json(rows.map((row) => ({ ...row, options: grouped.get(row.id) ?? [] })));
});

questionRoutes.post("/", async (c) => {
  const auth = c.get("auth")!;
  const input = questionSchema.parse(await c.req.json());
  const row = await db
    .insert(questions)
    .values({
      assessmentId: input.assessmentId ?? null,
      blueprintId: input.blueprintId ?? null,
      questionText: input.questionText,
      questionType: input.questionType,
      difficulty: input.difficulty,
      cognitiveLevel: input.cognitiveLevel,
      subject: input.subject,
      grade: input.grade,
      material: input.material,
      answerKey: input.answerKey,
      explanation: input.explanation,
      status: input.status,
      createdBy: auth.userId
    })
    .returning()
    .get();

  if (input.options.length) {
    await db.insert(questionOptions).values(
      input.options.map((option) => ({
        questionId: row.id,
        optionLabel: option.optionLabel,
        optionText: option.optionText,
        isCorrect: option.isCorrect
      }))
    );
  }

  await logAudit({ userId: auth.userId, action: "create", entityType: "question", entityId: row.id });
  return c.json(await withOptions(row.id), 201);
});

questionRoutes.get("/:id", async (c) => {
  const item = await withOptions(Number(c.req.param("id")));
  if (!item) {
    return c.json({ message: "Soal tidak ditemukan" }, 404);
  }
  return c.json(item);
});

questionRoutes.patch("/:id", async (c) => {
  const auth = c.get("auth")!;
  const id = Number(c.req.param("id"));
  const input = questionSchema.partial().parse(await c.req.json());
  await db
    .update(questions)
    .set({
      assessmentId: input.assessmentId ?? undefined,
      blueprintId: input.blueprintId ?? undefined,
      questionText: input.questionText,
      questionType: input.questionType,
      difficulty: input.difficulty,
      cognitiveLevel: input.cognitiveLevel,
      subject: input.subject,
      grade: input.grade,
      material: input.material,
      answerKey: input.answerKey,
      explanation: input.explanation,
      status: input.status,
      updatedAt: new Date().toISOString()
    })
    .where(eq(questions.id, id));

  if (input.options) {
    await db.delete(questionOptions).where(eq(questionOptions.questionId, id));
    if (input.options.length) {
      await db.insert(questionOptions).values(
        input.options.map((option) => ({
          questionId: id,
          optionLabel: option.optionLabel,
          optionText: option.optionText,
          isCorrect: option.isCorrect
        }))
      );
    }
  }

  await logAudit({ userId: auth.userId, action: "update", entityType: "question", entityId: id });
  return c.json(await withOptions(id));
});

questionRoutes.delete("/:id", async (c) => {
  const auth = c.get("auth")!;
  const id = Number(c.req.param("id"));
  await db.delete(questions).where(eq(questions.id, id));
  await logAudit({ userId: auth.userId, action: "delete", entityType: "question", entityId: id });
  return c.json({ success: true });
});
