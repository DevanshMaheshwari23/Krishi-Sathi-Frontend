import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import {
  Home,
  ShoppingBag,
  TrendingUp,
  MessageCircle,
  User,
  Plus,
  Settings,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = useCallback(
    (callback: () => void) => {
      setOpen(false);
      callback();
    },
    [setOpen]
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-[10%] z-50 w-[min(92vw,44rem)] -translate-x-1/2">
        <Command className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card-hover)]">
          <Command.Input
            placeholder="Search pages and actions..."
            className="w-full border-b border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--text-soft)]"
          />
          <Command.List className="max-h-[24rem] overflow-auto p-2">
            <Command.Empty className="px-3 py-10 text-center text-sm text-soft">No results</Command.Empty>

            <Command.Group heading="Navigation" className="px-1 py-2 text-xs text-soft">
              <PaletteItem icon={<Home className="h-4 w-4" />} onSelect={() => run(() => navigate("/dashboard"))}>
                Dashboard
              </PaletteItem>
              <PaletteItem icon={<ShoppingBag className="h-4 w-4" />} onSelect={() => run(() => navigate("/marketplace"))}>
                Marketplace
              </PaletteItem>
              <PaletteItem icon={<TrendingUp className="h-4 w-4" />} onSelect={() => run(() => navigate("/forecast"))}>
                Forecast
              </PaletteItem>
              <PaletteItem icon={<MessageCircle className="h-4 w-4" />} onSelect={() => run(() => navigate("/sathi"))}>
                Sathi AI
              </PaletteItem>
              <PaletteItem icon={<User className="h-4 w-4" />} onSelect={() => run(() => navigate("/profile"))}>
                Profile
              </PaletteItem>
            </Command.Group>

            {user?.role === "farmer" ? (
              <Command.Group heading="Farmer Actions" className="px-1 py-2 text-xs text-soft">
                <PaletteItem icon={<Plus className="h-4 w-4" />} onSelect={() => run(() => navigate("/marketplace/create"))}>
                  Create Listing
                </PaletteItem>
              </Command.Group>
            ) : null}

            <Command.Group heading="Account" className="px-1 py-2 text-xs text-soft">
              <PaletteItem
                icon={<Settings className="h-4 w-4" />}
                onSelect={() =>
                  run(() => {
                    navigate("/profile");
                    toast("Settings options coming soon", { icon: "ℹ️" });
                  })
                }
              >
                Preferences
              </PaletteItem>
              <PaletteItem
                icon={<LogOut className="h-4 w-4" />}
                onSelect={() =>
                  run(() => {
                    logout();
                    navigate("/login");
                    toast.success("Logged out successfully");
                  })
                }
              >
                Logout
              </PaletteItem>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </>
  );
};

const PaletteItem = ({
  icon,
  children,
  onSelect,
}: {
  icon: ReactNode;
  children: ReactNode;
  onSelect: () => void;
}) => {
  return (
    <Command.Item
      onSelect={onSelect}
      className="mb-1 flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-muted)] aria-selected:bg-[var(--surface-muted)] aria-selected:text-[var(--text)]"
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Command.Item>
  );
};
