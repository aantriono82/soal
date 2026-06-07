import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export function SettingsPage({ role }: { role: string }) {
  const queryClient = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<any[]>("/api/users"),
    enabled: role === "admin"
  });

  const resetMutation = useMutation({
    mutationFn: (password: string) => api("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ password }) }),
    onSuccess: () => toast.success("Password diperbarui")
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Pengaturan</h1>
        <p className="text-sm text-slate-500">Profil akun, pengguna, AI provider, dan storage.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ganti Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              resetMutation.mutate(String(form.get("password")));
              event.currentTarget.reset();
            }}
          >
            <FormField label="Password Baru">
              <Input name="password" type="password" required />
            </FormField>
            <Button type="submit">Simpan</Button>
          </form>
        </CardContent>
      </Card>
      {role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Pengguna</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Nama</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                </TR>
              </THead>
              <TBody>
                {(users ?? []).map((user) => (
                  <TR key={user.id}>
                    <TD>{user.name}</TD>
                    <TD>{user.email}</TD>
                    <TD>{user.role}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
