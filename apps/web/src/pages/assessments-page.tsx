import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export function AssessmentsPage() {
  const queryClient = useQueryClient();
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api<any[]>("/api/assessments")
  });
  const { data: blueprints } = useQuery({
    queryKey: ["blueprints", selectedAssessment],
    queryFn: () => api<any[]>(`/api/assessments/${selectedAssessment}/blueprints`),
    enabled: Boolean(selectedAssessment)
  });

  const createAssessment = useMutation({
    mutationFn: (payload: Record<string, string>) => api("/api/assessments", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => {
      toast.success("Asesmen dibuat");
      await queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const createBlueprint = useMutation({
    mutationFn: (payload: Record<string, string>) =>
      api(`/api/assessments/${selectedAssessment}/blueprints`, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => {
      toast.success("Kisi-kisi ditambahkan");
      await queryClient.invalidateQueries({ queryKey: ["blueprints", selectedAssessment] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Asesmen & Kisi-Kisi</h1>
        <p className="text-sm text-muted-foreground">Kelola proyek asesmen dan kisi-kisi per indikator.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Asesmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Judul</TH>
                    <TH>Mapel</TH>
                    <TH>Kelas</TH>
                    <TH></TH>
                  </TR>
                </THead>
                <TBody>
                  {(assessments ?? []).map((item) => (
                    <TR key={item.id}>
                      <TD>{item.title}</TD>
                      <TD>{item.subject}</TD>
                      <TD>{item.grade}</TD>
                      <TD>
                        <Button variant="outline" onClick={() => setSelectedAssessment(item.id)}>
                          Lihat Kisi-Kisi
                        </Button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Buat Asesmen</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                createAssessment.mutate(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>);
                event.currentTarget.reset();
              }}
            >
              <FormField label="Nama Asesmen">
                <Input name="title" required />
              </FormField>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Mapel">
                  <Input name="subject" required />
                </FormField>
                <FormField label="Kelas">
                  <Input name="grade" required />
                </FormField>
                <FormField label="Semester">
                  <Input name="semester" required />
                </FormField>
                <FormField label="Tahun Ajaran">
                  <Input name="academicYear" required />
                </FormField>
              </div>
              <FormField label="Kurikulum">
                <Input name="curriculum" defaultValue="Kurikulum Merdeka" required />
              </FormField>
              <Button type="submit">Simpan Asesmen</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {selectedAssessment && (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Kisi-Kisi Asesmen #{selectedAssessment}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(blueprints ?? []).map((item) => (
                  <div key={item.id} className="rounded-md border border-border p-4">
                  <div className="font-medium">{item.material}</div>
                  <div className="text-sm text-muted-foreground">{item.indicator}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {item.questionType} | {item.cognitiveLevel} | {item.difficulty} | {item.questionCount} soal
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tambah Kisi-Kisi</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createBlueprint.mutate(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>);
                  event.currentTarget.reset();
                }}
              >
                <FormField label="CP/KD">
                  <Input name="competency" required />
                </FormField>
                <FormField label="Tujuan Pembelajaran">
                  <Textarea name="learningObjective" required />
                </FormField>
                <FormField label="Materi">
                  <Input name="material" required />
                </FormField>
                <FormField label="Indikator">
                  <Textarea name="indicator" required />
                </FormField>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Level Kognitif">
                    <Input name="cognitiveLevel" defaultValue="C3" required />
                  </FormField>
                  <FormField label="Tipe Soal">
                    <Input name="questionType" defaultValue="pilihan_ganda" required />
                  </FormField>
                  <FormField label="Kesulitan">
                    <Input name="difficulty" defaultValue="sedang" required />
                  </FormField>
                  <FormField label="Jumlah Soal">
                    <Input name="questionCount" type="number" defaultValue="5" required />
                  </FormField>
                </div>
                <FormField label="Bobot">
                  <Input name="weight" type="number" defaultValue="1" required />
                </FormField>
                <Button type="submit">Simpan Kisi-Kisi</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
