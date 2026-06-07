import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { Select } from "@/components/ui/select";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, string>) =>
      api<{ user: unknown }>(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Berhasil masuk");
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Login" : "Register"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              mutation.mutate(Object.fromEntries(form) as Record<string, string>);
            }}
          >
            {mode === "register" && (
              <>
                <FormField label="Nama">
                  <Input name="name" required />
                </FormField>
                <FormField label="Role">
                  <Select name="role" defaultValue="guru">
                    <option value="guru">Guru</option>
                    <option value="admin">Admin</option>
                  </Select>
                </FormField>
              </>
            )}
            <FormField label="Email">
              <Input type="email" name="email" required defaultValue={mode === "login" ? "admin@demo.local" : ""} />
            </FormField>
            <FormField label="Password">
              <Input type="password" name="password" required defaultValue={mode === "login" ? "admin123" : ""} />
            </FormField>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
            </Button>
          </form>
          <button className="mt-4 text-sm text-primary" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Buat akun baru" : "Sudah punya akun"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
