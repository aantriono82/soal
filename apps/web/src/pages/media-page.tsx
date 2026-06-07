import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MediaPage() {
  const queryClient = useQueryClient();
  const { data: media } = useQuery({
    queryKey: ["media"],
    queryFn: () => api<any[]>("/api/media")
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      api("/api/media/upload", {
        method: "POST",
        body: formData,
        headers: {}
      }),
    onSuccess: async () => {
      toast.success("Media berhasil diunggah");
      await queryClient.invalidateQueries({ queryKey: ["media"] });
    }
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="text-sm text-slate-500">Upload gambar, audio, video, atau PDF untuk stimulus soal.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-wrap items-center gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              uploadMutation.mutate(form);
              event.currentTarget.reset();
            }}
          >
            <input type="file" name="file" required className="text-sm" />
            <Button type="submit">Upload</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Daftar File</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {(media ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
              <div>
                <div className="font-medium">{item.fileName}</div>
                <div className="text-slate-500">
                  {item.mimeType} • {(item.fileSize / 1024).toFixed(1)} KB
                </div>
              </div>
              <a className="text-blue-700" href={item.publicUrl} target="_blank">
                Buka
              </a>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
