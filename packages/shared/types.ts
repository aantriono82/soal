export type UserRole = "admin" | "guru";
export type QuestionStatus = "draft" | "valid" | "review";
export type QuestionType =
  | "pilihan_ganda"
  | "pilihan_ganda_kompleks"
  | "benar_salah"
  | "menjodohkan"
  | "isian_singkat"
  | "uraian";

export interface DashboardStats {
  totalQuestions: number;
  totalAssessments: number;
  totalPackages: number;
  totalUsers: number;
  questionsBySubject: Array<{ subject: string; total: number }>;
  recentActivities: Array<{
    id: number;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
    userName: string;
  }>;
}
