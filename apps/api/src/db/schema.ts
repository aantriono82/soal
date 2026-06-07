import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("guru"),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const assessments = sqliteTable("assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  semester: text("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  curriculum: text("curriculum").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const blueprints = sqliteTable("blueprints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assessmentId: integer("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  competency: text("competency").notNull(),
  learningObjective: text("learning_objective").notNull(),
  material: text("material").notNull(),
  indicator: text("indicator").notNull(),
  cognitiveLevel: text("cognitive_level").notNull(),
  questionType: text("question_type").notNull(),
  difficulty: text("difficulty").notNull(),
  questionCount: integer("question_count").notNull(),
  weight: integer("weight").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assessmentId: integer("assessment_id").references(() => assessments.id, { onDelete: "set null" }),
  blueprintId: integer("blueprint_id").references(() => blueprints.id, { onDelete: "set null" }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(),
  difficulty: text("difficulty").notNull(),
  cognitiveLevel: text("cognitive_level").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  material: text("material").notNull(),
  answerKey: text("answer_key").notNull(),
  explanation: text("explanation").notNull(),
  status: text("status").notNull().default("draft"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const questionOptions = sqliteTable("question_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  optionLabel: text("option_label").notNull(),
  optionText: text("option_text").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false)
});

export const mediaFiles = sqliteTable("media_files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  bucket: text("bucket").notNull(),
  objectKey: text("object_key").notNull(),
  publicUrl: text("public_url").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const questionMedia = sqliteTable("question_media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  mediaId: integer("media_id").notNull().references(() => mediaFiles.id, { onDelete: "cascade" })
});

export const questionPackages = sqliteTable("question_packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  assessmentId: integer("assessment_id").references(() => assessments.id, { onDelete: "set null" }),
  description: text("description").notNull().default(""),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const packageQuestions = sqliteTable("package_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packageId: integer("package_id").notNull().references(() => questionPackages.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  orderNumber: integer("order_number").notNull(),
  scoreWeight: integer("score_weight").notNull().default(1)
});

export const aiGenerations = sqliteTable("ai_generations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  assessmentId: integer("assessment_id").references(() => assessments.id, { onDelete: "set null" }),
  blueprintId: integer("blueprint_id").references(() => blueprints.id, { onDelete: "set null" }),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  tokenUsage: integer("token_usage").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const usersRelations = relations(users, ({ many }) => ({
  assessments: many(assessments),
  questions: many(questions)
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  creator: one(users, { fields: [assessments.createdBy], references: [users.id] }),
  blueprints: many(blueprints),
  questions: many(questions)
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  assessment: one(assessments, { fields: [questions.assessmentId], references: [assessments.id] }),
  blueprint: one(blueprints, { fields: [questions.blueprintId], references: [blueprints.id] }),
  options: many(questionOptions)
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, { fields: [questionOptions.questionId], references: [questions.id] })
}));
