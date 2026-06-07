import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function GeneratorPage() {
  const queryClient = useQueryClient();
  const [generated, setGenerated] = useState<any[]>([]);
  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api<any[]>("/api/assessments")
  });

  const generateMutation = useMutation({
    mutationFn: (payload: Record<string, string>) => api<any>("/api/ai/generate-questions", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (data) => setGenerated(data.questions),
    onError: (error: Error) => toast.error(error.message)
  });

  const saveMutation = useMutation({
    mutationFn: () => api("/api/ai/save-generated", { method: "POST", body: JSON.stringify(generated) }),
    onSuccess: async () => {
      toast.success("Soal hasil generate disimpan");
      await queryClient.invalidateQueries({ queryKey: ["questions"] });
    }
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Generator Soal AI</h1>
        <p className="text-sm text-slate-500">Generate soal dari indikator, materi, atau sumber teks.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Form Generate</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const payload = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
                if (!payload.assessmentId) delete payload.assessmentId;
                generateMutation.mutate(payload);
              }}
            >
              <FormField label="Asesmen">
                <select name="assessmentId" className="h-10 rounded-md border border-border bg-white px-3 text-sm">
                  <option value="">Tanpa asesmen</option>
                  {(assessments ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </FormField>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Mapel">
                  <Input name="subject" defaultValue="Matematika" required />
                </FormField>
                <FormField label="Kelas">
                  <Input name="grade" defaultValue="VIII" required />
                </FormField>
                <FormField label="Kurikulum">
                  <Input name="curriculum" defaultValue="Kurikulum Merdeka" required />
                </FormField>
                <FormField label="Level Kognitif">
                  <Input name="cognitiveLevel" defaultValue="C3" required />
                </FormField>
                <FormField label="Tipe Soal">
                  <Input name="questionType" defaultValue="pilihan_ganda" required />
                </FormField>
                <FormField label="Jumlah Soal">
                  <Input name="questionCount" type="number" defaultValue="5" required />
                </FormField>
                <FormField label="Kesulitan">
                  <Input name="difficulty" defaultValue="sedang" required />
                </FormField>
              </div>
              <FormField label="Materi">
                <Input name="material" defaultValue="SPLDV" required />
              </FormField>
              <FormField label="Indikator">
                <Textarea name="indicator" defaultValue="Menentukan penyelesaian SPLDV" required />
              </FormField>
              <FormField label="Teks Sumber">
                <Textarea name="sourceText" />
              </FormField>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? "Menghasilkan..." : "Generate Soal"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Preview Hasil</CardTitle>
            <Button variant="outline" onClick={() => saveMutation.mutate()} disabled={!generated.length}>
              Simpan ke Bank Soal
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            {generated.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-8 text-sm text-slate-500">Belum ada hasil generate.</div>
            ) : (
              generated.map((item, index) => (
                <div key={index} className="rounded-md border border-border p-4">
                  <div className="font-medium">{item.questionText}</div>
                  <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                    {(item.options ?? []).map((option: any) => (
                      <li key={option.optionLabel}>
                        {option.optionLabel}. {option.optionText}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-xs text-slate-500">Kunci: {item.answerKey}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
