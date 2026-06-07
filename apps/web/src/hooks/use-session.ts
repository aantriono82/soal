import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ user: { id: number; name: string; email: string; role: string } }>("/api/auth/me"),
    retry: false
  });
}
