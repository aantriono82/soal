import type { ReactNode } from "react";
import { FileStack, Files, Gauge, Library, LogOut, Settings, Sparkles, UserSquare2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "./ui/button";

const items = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/assessments", label: "Asesmen", icon: Files },
  { to: "/generator", label: "Generator AI", icon: Sparkles },
  { to: "/questions", label: "Bank Soal", icon: Library },
  { to: "/packages", label: "Paket Soal", icon: FileStack },
  { to: "/media", label: "Media", icon: UserSquare2 },
  { to: "/settings", label: "Pengaturan", icon: Settings }
];

export function AppShell({
  children,
  user,
  onLogout
}: {
  children: ReactNode;
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-white">
          <div className="border-b border-border px-6 py-5">
            <div className="text-lg font-semibold">Assessment AI App</div>
            <div className="mt-2 text-xs text-slate-500">{user.name}</div>
            <div className="text-xs text-slate-400">{user.role}</div>
          </div>
          <nav className="grid gap-1 p-3">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3">
            <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>
        <main className="overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
