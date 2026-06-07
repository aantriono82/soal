import { Hono } from "hono";
import { aiGenerateSchema, questionSchema } from "@shared/schemas";
import { db } from "../db/client";
import { aiGenerations, questionOptions, questions } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";
import { generateQuestions } from "../services/ai";

export const aiRoutes = new Hono<AuthContext>();
aiRoutes.use("*", requireAuth);

aiRoutes.post("/generate-questions", async (c) => {
  const auth = c.get("auth")!;
  const input = aiGenerateSchema.parse(await c.req.json());
  const prompt = JSON.stringify(input);
  const result = await generateQuestions(input);

  await db.insert(aiGenerations).values({
    userId: auth.userId,
    assessmentId: input.assessmentId ?? null,
    blueprintId: input.blueprintId ?? null,
    prompt,
    response: JSON.stringify(result.questions),
    provider: result.provider,
    model: result.model,
    tokenUsage: result.tokenUsage
  });

  return c.json(result);
});

aiRoutes.post("/regenerate-question", async (c) => {
  const body = await c.req.json();
  return c.json({
    question: {
      ...body,
      questionText: `${body.questionText} (versi regenerasi)`,
      explanation: `${body.explanation} Soal telah diregenerasi.`
    }
  });
});

aiRoutes.post("/improve-question", async (c) => {
  const body = await c.req.json();
  return c.json({
    question: {
      ...body,
      questionText: `${body.questionText}\n\nPetunjuk diperjelas untuk meningkatkan kualitas soal.`
    }
  });
});

aiRoutes.post("/generate-explanation", async (c) => {
  const body = await c.req.json();
  return c.json({
    explanation: `Pembahasan otomatis untuk soal: ${body.questionText ?? ""}`
  });
});

aiRoutes.post("/generate-variants", async (c) => {
  const body = await c.req.json();
  return c.json({
    variants: [
      { ...body, questionText: `${body.questionText} (Variasi A)` },
      { ...body, questionText: `${body.questionText} (Variasi B)` }
    ]
  });
});

aiRoutes.post("/save-generated", async (c) => {
  const auth = c.get("auth")!;
  const payload = questionSchema.array().parse(await c.req.json());
  const saved: Array<Record<string, unknown>> = [];
  for (const item of payload) {
    const question = await db
      .insert(questions)
      .values({
        assessmentId: item.assessmentId ?? null,
        blueprintId: item.blueprintId ?? null,
        questionText: item.questionText,
        questionType: item.questionType,
        difficulty: item.difficulty,
        cognitiveLevel: item.cognitiveLevel,
        subject: item.subject,
        grade: item.grade,
        material: item.material,
        answerKey: item.answerKey,
        explanation: item.explanation,
        status: item.status,
        createdBy: auth.userId
      })
      .returning()
      .get();
    if (item.options.length) {
      await db.insert(questionOptions).values(
        item.options.map((option) => ({
          questionId: question.id,
          optionLabel: option.optionLabel,
          optionText: option.optionText,
          isCorrect: option.isCorrect
        }))
      );
    }
    saved.push(question);
  }
  return c.json(saved, 201);
});
