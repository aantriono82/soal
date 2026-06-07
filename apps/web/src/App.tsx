import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { useTheme } from "@/components/theme-provider";
import { api } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { AssessmentsPage } from "@/pages/assessments-page";
import { AuthPage } from "@/pages/auth-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { GeneratorPage } from "@/pages/generator-page";
import { MediaPage } from "@/pages/media-page";
import { PackagesPage } from "@/pages/packages-page";
import { QuestionsPage } from "@/pages/questions-page";
import { SettingsPage } from "@/pages/settings-page";

export default function App() {
  const queryClient = useQueryClient();
  const session = useSession();
  const { theme } = useTheme();

  const logoutMutation = useMutation({
    mutationFn: () => api("/api/auth/logout", { method: "POST" }),
    onSuccess: async () => {
      toast.success("Sesi berakhir");
      await queryClient.invalidateQueries({ queryKey: ["session"] });
    }
  });

  if (session.isLoading) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Memuat aplikasi...</div>;
  }

  if (!session.data?.user) {
    return <AuthPage />;
  }

  return (
    <>
      <AppShell user={session.data.user} onLogout={() => logoutMutation.mutate()}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/settings" element={<SettingsPage role={session.data.user.role} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <Toaster richColors theme={theme} />
    </>
  );
}
