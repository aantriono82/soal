import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "guru"]).default("guru")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const assessmentSchema = z.object({
  title: z.string().min(3),
  subject: z.string().min(2),
  grade: z.string().min(1),
  semester: z.string().min(1),
  academicYear: z.string().min(4),
  curriculum: z.string().min(2)
});

export const blueprintSchema = z.object({
  assessmentId: z.coerce.number().int().positive(),
  competency: z.string().min(3),
  learningObjective: z.string().min(3),
  material: z.string().min(2),
  indicator: z.string().min(3),
  cognitiveLevel: z.string().min(1),
  questionType: z.string().min(1),
  difficulty: z.string().min(1),
  questionCount: z.coerce.number().int().positive(),
  weight: z.coerce.number().int().min(1)
});

export const questionOptionSchema = z.object({
  optionLabel: z.string().min(1).max(5),
  optionText: z.string().min(1),
  isCorrect: z.boolean().default(false)
});

export const questionSchema = z.object({
  assessmentId: z.coerce.number().int().positive().nullable().optional(),
  blueprintId: z.coerce.number().int().positive().nullable().optional(),
  questionText: z.string().min(5),
  questionType: z.string().min(1),
  difficulty: z.string().min(1),
  cognitiveLevel: z.string().min(1),
  subject: z.string().min(2),
  grade: z.string().min(1),
  material: z.string().min(2),
  answerKey: z.string().min(1),
  explanation: z.string().min(3),
  status: z.enum(["draft", "valid", "review"]).default("draft"),
  options: z.array(questionOptionSchema).default([])
});

export const packageSchema = z.object({
  title: z.string().min(3),
  assessmentId: z.coerce.number().int().positive().nullable().optional(),
  description: z.string().default(""),
  questionIds: z.array(z.number().int().positive()).default([])
});

export const aiGenerateSchema = z.object({
  assessmentId: z.coerce.number().int().positive().nullable().optional(),
  blueprintId: z.coerce.number().int().positive().nullable().optional(),
  subject: z.string().min(2),
  grade: z.string().min(1),
  curriculum: z.string().min(2).default("Kurikulum Merdeka"),
  material: z.string().min(2),
  indicator: z.string().min(3),
  cognitiveLevel: z.string().min(1).default("C3"),
  questionType: z.string().min(1),
  questionCount: z.coerce.number().int().min(1).max(20),
  difficulty: z.string().min(1),
  sourceText: z.string().optional().default("")
});
