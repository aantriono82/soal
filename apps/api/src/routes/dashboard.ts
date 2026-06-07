import { Hono } from "hono";
import { count, desc, sql } from "drizzle-orm";
import { db } from "../db/client";
import { assessments, auditLogs, questionPackages, questions, users } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";

export const dashboardRoutes = new Hono<AuthContext>();

dashboardRoutes.get("/stats", requireAuth, async (c) => {
  const [questionCount, assessmentCount, packageCount, userCount] = await Promise.all([
    db.select({ total: count() }).from(questions).get(),
    db.select({ total: count() }).from(assessments).get(),
    db.select({ total: count() }).from(questionPackages).get(),
    db.select({ total: count() }).from(users).get()
  ]);

  const questionsBySubject = await db
    .select({ subject: questions.subject, total: count() })
    .from(questions)
    .groupBy(questions.subject)
    .orderBy(desc(count()));

  const recentActivities = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      createdAt: auditLogs.createdAt,
      userName: sql<string>`COALESCE(${users.name}, 'Sistem')`
    })
    .from(auditLogs)
    .leftJoin(users, sql`${users.id} = ${auditLogs.userId}`)
    .orderBy(desc(auditLogs.id))
    .limit(10);

  return c.json({
    totalQuestions: questionCount?.total ?? 0,
    totalAssessments: assessmentCount?.total ?? 0,
    totalPackages: packageCount?.total ?? 0,
    totalUsers: userCount?.total ?? 0,
    questionsBySubject,
    recentActivities
  });
});
