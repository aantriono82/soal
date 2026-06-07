import { env } from "../lib/env";
import type { z } from "zod";
import { aiGenerateSchema } from "@shared/schemas";

type AIInput = z.infer<typeof aiGenerateSchema>;

function buildFallback(input: AIInput) {
  return Array.from({ length: input.questionCount }, (_, index) => ({
    questionText: `Soal ${index + 1}: Pada materi ${input.material}, ${input.indicator.toLowerCase()}. Pilih jawaban yang paling tepat.`,
    questionType: input.questionType,
    difficulty: input.difficulty,
    cognitiveLevel: input.cognitiveLevel,
    subject: input.subject,
    grade: input.grade,
    material: input.material,
    answerKey: "A",
    explanation: `Pembahasan singkat untuk indikator ${input.indicator}.`,
    status: "draft",
    options: [
      { optionLabel: "A", optionText: "Pilihan jawaban benar", isCorrect: true },
      { optionLabel: "B", optionText: "Distraktor 1", isCorrect: false },
      { optionLabel: "C", optionText: "Distraktor 2", isCorrect: false },
      { optionLabel: "D", optionText: "Distraktor 3", isCorrect: false }
    ]
  }));
}

export async function generateQuestions(input: AIInput) {
  if (!env.aiApiKey) {
    return {
      provider: "fallback",
      model: "local-template",
      tokenUsage: 0,
      questions: buildFallback(input)
    };
  }

  const prompt = `
Anda adalah generator soal asesmen sekolah.
Kembalikan JSON dengan properti "questions".
Setiap soal wajib memuat questionText, questionType, difficulty, cognitiveLevel, subject, grade, material, answerKey, explanation, status, options.
Input:
${JSON.stringify(input, null, 2)}
  `.trim();

  const response = await fetch(`${env.aiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.aiApiKey}`
    },
    body: JSON.stringify({
      model: env.aiModel,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Anda menghasilkan JSON yang valid untuk soal asesmen."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    return {
      provider: "fallback",
      model: "local-template",
      tokenUsage: 0,
      questions: buildFallback(input)
    };
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  return {
    provider: "openai-compatible",
    model: env.aiModel,
    tokenUsage: json.usage?.total_tokens ?? 0,
    questions: parsed.questions ?? buildFallback(input)
  };
}
