import type { ReactNode } from "react";
import { FileStack, Files, Gauge, Library, LogOut, Moon, Settings, Sparkles, Sun, User, UserSquare2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "./theme-provider";
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
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-sidebar text-sidebar-foreground">
          <div className="border-b border-border px-6 py-5">
            <div className="text-lg font-semibold">Assessment AI App</div>
          </div>
          <nav className="grid gap-1 p-3">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
        <div className="grid min-h-screen grid-rows-[auto_1fr]">
          <header className="border-b border-border bg-background px-6 py-4">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-11 shrink-0 px-0"
                onClick={toggleTheme}
                title={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <div className="flex h-11 items-center gap-3 rounded-md border border-border bg-card px-3">
                <div className="grid h-6 w-6 place-items-center text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium capitalize">{user.role}</div>
              </div>
            </div>
          </header>
          <main className="overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
