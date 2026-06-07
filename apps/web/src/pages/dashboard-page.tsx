import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<any>("/api/dashboard/stats")
  });

  const stats = [
    ["Total Soal", data?.totalQuestions ?? 0],
    ["Total Asesmen", data?.totalAssessments ?? 0],
    ["Total Paket", data?.totalPackages ?? 0],
    ["Total Pengguna", data?.totalUsers ?? 0]
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan aktivitas bank soal dan asesmen.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statistik Soal per Mapel</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(data?.questionsBySubject ?? []).map((item: any) => (
              <div key={item.subject} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span>{item.subject}</span>
                <Badge>{item.total}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(data?.recentActivities ?? []).map((item: any) => (
              <div key={item.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <div className="font-medium">{item.userName}</div>
                <div className="text-slate-500">
                  {item.action} {item.entityType} #{item.entityId}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
