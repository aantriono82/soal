import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PackagesPage() {
  const queryClient = useQueryClient();
  const { data: packs } = useQuery({
    queryKey: ["packages"],
    queryFn: () => api<any[]>("/api/packages")
  });
  const { data: questions } = useQuery({
    queryKey: ["questions"],
    queryFn: () => api<any[]>("/api/questions")
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api("/api/packages", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => {
      toast.success("Paket dibuat");
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
    }
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Paket Soal</h1>
        <p className="text-sm text-muted-foreground">Rakit paket soal dari bank soal lalu export PDF atau DOCX.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Buat Paket</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const picked = form.getAll("questionIds").map((value) => Number(value));
                createMutation.mutate({
                  title: form.get("title"),
                  description: form.get("description"),
                  questionIds: picked
                });
                event.currentTarget.reset();
              }}
            >
              <FormField label="Nama Paket">
                <Input name="title" required />
              </FormField>
              <FormField label="Deskripsi">
                <Textarea name="description" />
              </FormField>
              <div className="grid gap-2 rounded-md border border-border p-3">
                <div className="text-sm font-medium">Pilih Soal</div>
                <div className="grid max-h-72 gap-2 overflow-y-auto">
                  {(questions ?? []).map((question) => (
                    <label key={question.id} className="flex items-start gap-2 rounded-md border border-border p-2 text-sm">
                      <input type="checkbox" name="questionIds" value={question.id} className="mt-1" />
                      <span>{question.questionText}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit">Simpan Paket</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Paket</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {(packs ?? []).map((pack) => (
              <div key={pack.id} className="rounded-md border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{pack.title}</div>
                    <div className="text-sm text-muted-foreground">{pack.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <a className="inline-flex h-10 items-center rounded-md border border-border bg-card px-4 text-sm hover:bg-secondary" href={`/api/export/package/${pack.id}/pdf`}>
                      PDF
                    </a>
                    <a className="inline-flex h-10 items-center rounded-md border border-border bg-card px-4 text-sm hover:bg-secondary" href={`/api/export/package/${pack.id}/docx`}>
                      DOCX
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
