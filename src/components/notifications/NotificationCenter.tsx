import { useState } from "react";
import { Bell, CheckCheck, X, Package, TrendingUp, MessageSquare } from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/cn";

interface Notification {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const now = Date.now();
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Listing sold",
    message: "Your wheat listing was marked as sold.",
    timestamp: new Date(now - 240000),
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Price alert",
    message: "Rice prices moved up by 12% in your region.",
    timestamp: new Date(now - 900000),
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "New message",
    message: "Rajesh Kumar sent a marketplace message.",
    timestamp: new Date(now - 1800000),
    read: true,
  },
];

const typeIcon = {
  success: Package,
  info: TrendingUp,
  warning: MessageSquare,
} as const;

const typeBadgeVariant = {
  success: "success",
  info: "info",
  warning: "warning",
} as const;

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(initialNotifications);
  const [currentTime] = useState(() => Date.now());

  const unread = items.filter((item) => !item.read).length;

  const timeAgo = (date: Date) => {
    const diff = Math.floor((currentTime - date.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hour = Math.floor(diff / 60);
    if (hour < 24) return `${hour}h ago`;
    return `${Math.floor(hour / 24)}d ago`;
  };

  const markAllRead = () => setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  const remove = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,24rem)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-card-hover)]">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="font-[var(--font-display)] text-base font-bold">Notifications</p>
              <p className="text-xs text-soft">{unread} unread</p>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Read all
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {items.map((item) => {
              const Icon = typeIcon[item.type];
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-[var(--radius-md)] border p-3 transition",
                    item.read
                      ? "border-[var(--border)] bg-[var(--surface)]"
                      : "border-[var(--border-strong)] bg-[var(--surface-muted)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--text-muted)]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-sm font-semibold">{item.title}</p>
                          <Badge variant={typeBadgeVariant[item.type]}>{item.type}</Badge>
                        </div>
                        <p className="text-xs text-muted">{item.message}</p>
                        <p className="mt-1 text-[11px] text-soft">{timeAgo(item.timestamp)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded-[var(--radius-sm)] p-1 text-soft hover:bg-[var(--surface-strong)]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
