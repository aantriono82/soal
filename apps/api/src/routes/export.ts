import { Hono } from "hono";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { buildPackageDocx, buildPackagePdf } from "../services/export";
import { packageQuestions, questionPackages, questionOptions, questions, blueprints } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";

export const exportRoutes = new Hono<AuthContext>();
exportRoutes.use("*", requireAuth);

function toArrayBuffer(bytes: Uint8Array | Buffer) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function packageLines(id: number, type: "questions" | "answers" | "explanations") {
  const pack = await db.select().from(questionPackages).where(eq(questionPackages.id, id)).get();
  if (!pack) return null;
  const links = await db.select().from(packageQuestions).where(eq(packageQuestions.packageId, id)).orderBy(packageQuestions.orderNumber);
  const ids = links.map((link) => link.questionId);
  const qs = ids.length ? await db.select().from(questions).where(inArray(questions.id, ids)) : [];
  const opts = ids.length ? await db.select().from(questionOptions).where(inArray(questionOptions.questionId, ids)) : [];

  const lines = qs.flatMap((question, index) => {
    if (type === "answers") {
      return [`${index + 1}. ${question.answerKey}`];
    }
    if (type === "explanations") {
      return [`${index + 1}. ${question.explanation}`];
    }
    return [
      `${index + 1}. ${question.questionText}`,
      ...opts.filter((option) => option.questionId === question.id).map((option) => `   ${option.optionLabel}. ${option.optionText}`)
    ];
  });

  return { title: pack.title, lines };
}

exportRoutes.get("/package/:id/pdf", async (c) => {
  const data = await packageLines(Number(c.req.param("id")), "questions");
  if (!data) return c.json({ message: "Paket tidak ditemukan" }, 404);
  const bytes = await buildPackagePdf(`Naskah Soal - ${data.title}`, data.lines);
  return new Response(new Blob([toArrayBuffer(bytes)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="paket-${c.req.param("id")}.pdf"`
    }
  });
});

exportRoutes.get("/package/:id/docx", async (c) => {
  const data = await packageLines(Number(c.req.param("id")), "questions");
  if (!data) return c.json({ message: "Paket tidak ditemukan" }, 404);
  const bytes = await buildPackageDocx(`Naskah Soal - ${data.title}`, data.lines);
  return new Response(new Blob([toArrayBuffer(bytes)]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="paket-${c.req.param("id")}.docx"`
    }
  });
});

exportRoutes.get("/package/:id/answer-key/pdf", async (c) => {
  const data = await packageLines(Number(c.req.param("id")), "answers");
  if (!data) return c.json({ message: "Paket tidak ditemukan" }, 404);
  const bytes = await buildPackagePdf(`Kunci Jawaban - ${data.title}`, data.lines);
  return new Response(new Blob([toArrayBuffer(bytes)]), { headers: { "Content-Type": "application/pdf" } });
});

exportRoutes.get("/package/:id/explanation/pdf", async (c) => {
  const data = await packageLines(Number(c.req.param("id")), "explanations");
  if (!data) return c.json({ message: "Paket tidak ditemukan" }, 404);
  const bytes = await buildPackagePdf(`Pembahasan - ${data.title}`, data.lines);
  return new Response(new Blob([toArrayBuffer(bytes)]), { headers: { "Content-Type": "application/pdf" } });
});

exportRoutes.get("/assessment/:id/blueprint/pdf", async (c) => {
  const items = await db.select().from(blueprints).where(eq(blueprints.assessmentId, Number(c.req.param("id"))));
  const bytes = await buildPackagePdf(
    `Kisi-kisi Asesmen ${c.req.param("id")}`,
    items.map((item, index) => `${index + 1}. ${item.material} | ${item.indicator} | ${item.cognitiveLevel}`)
  );
  return new Response(new Blob([toArrayBuffer(bytes)]), { headers: { "Content-Type": "application/pdf" } });
});
