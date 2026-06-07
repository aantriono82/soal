import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export function QuestionsPage() {
  const queryClient = useQueryClient();
  const { data: questions } = useQuery({
    queryKey: ["questions"],
    queryFn: () => api<any[]>("/api/questions")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api(`/api/questions/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      toast.success("Soal dihapus");
      await queryClient.invalidateQueries({ queryKey: ["questions"] });
    }
  });

  const validateMutation = useMutation({
    mutationFn: (question: any) => api(`/api/questions/${question.id}`, { method: "PATCH", body: JSON.stringify({ ...question, status: "valid" }) }),
    onSuccess: async () => {
      toast.success("Soal ditandai valid");
      await queryClient.invalidateQueries({ queryKey: ["questions"] });
    }
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bank Soal</h1>
        <p className="text-sm text-muted-foreground">Cari, review, validasi, dan kelola seluruh soal.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Soal</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Soal</TH>
                <TH>Mapel</TH>
                <TH>Tipe</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {(questions ?? []).map((question) => (
                <TR key={question.id}>
                  <TD className="max-w-xl">
                    <div className="font-medium">{question.questionText}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge>{question.grade}</Badge>
                      <Badge>{question.material}</Badge>
                      <Badge>{question.difficulty}</Badge>
                    </div>
                  </TD>
                  <TD>{question.subject}</TD>
                  <TD>{question.questionType}</TD>
                  <TD>
                    <Badge className={question.status === "valid" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : ""}>{question.status}</Badge>
                  </TD>
                  <TD className="space-x-2">
                    <Button variant="outline" onClick={() => validateMutation.mutate(question)}>
                      Validasi
                    </Button>
                    <Button variant="destructive" onClick={() => deleteMutation.mutate(question.id)}>
                      Hapus
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Filter Cepat</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <FormField label="Mapel">
            <Input placeholder="Matematika" />
          </FormField>
          <FormField label="Kelas">
            <Input placeholder="VIII" />
          </FormField>
          <FormField label="Materi">
            <Input placeholder="SPLDV" />
          </FormField>
          <FormField label="Tipe">
            <Input placeholder="pilihan_ganda" />
          </FormField>
          <FormField label="Kesulitan">
            <Input placeholder="sedang" />
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}
