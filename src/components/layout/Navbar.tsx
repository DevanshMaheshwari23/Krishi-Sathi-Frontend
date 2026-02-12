import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  TrendingUp,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import toast from "react-hot-toast";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { useTheme } from "../../theme/theme-context";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";
import { cn } from "../../lib/cn";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
  { name: "Forecast", path: "/forecast", icon: TrendingUp },
  { name: "Sathi AI", path: "/sathi", icon: MessageCircle },
] as const;

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userInitial = useMemo(() => user?.name?.charAt(0).toUpperCase() ?? "U", [user?.name]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] font-bold">
            KS
          </div>
          <div>
            <p className="font-[var(--font-display)] text-base font-bold">Krishi Sathi</p>
            <p className="text-xs text-soft">Farm intelligence platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-[var(--surface)] text-[var(--text)] shadow"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
              document.dispatchEvent(event);
            }}
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">⌘K</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <NotificationCenter />

          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-soft)] font-semibold text-[var(--primary)]">
              {userInitial}
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold leading-tight">{user?.name ?? "User"}</span>
              <span className="block text-xs capitalize text-soft">{user?.role ?? "member"}</span>
            </span>
          </Link>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 lg:hidden">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold",
                    active
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <div className="flex items-center gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={toggleTheme}>
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Theme
              </Button>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
};
