"use client";

import { Bell, CheckCheck, Clock3, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types/database";
import { Button, EmptyState } from "@/components/ui";

type NotificationItem = {
  id: string;
  icon: typeof FileText;
  title: string;
  body: string;
  isRead?: boolean;
};

function iconForType(type: Notification["type"]): typeof FileText {
  if (type === "success") return CheckCheck;
  if (type === "warning" || type === "action_required") return Clock3;
  return FileText;
}

export function DashboardNotifications() {
  const t = useTranslations("Notifications");
  const [open, setOpen] = React.useState(false);
  const [readIds, setReadIds] = React.useState<string[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const notificationsQuery = useNotifications(8);
  const items = React.useMemo<NotificationItem[]>(
    () =>
      (notificationsQuery.data ?? []).map((n) => ({
        id: n.id,
        icon: iconForType(n.type),
        title: n.title,
        body: n.message,
        isRead: n.is_read,
      })),
    [notificationsQuery.data],
  );

  React.useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  React.useEffect(() => {
    setReadIds(items.filter((item) => item.isRead).map((item) => item.id));
  }, [items]);

  const unreadCount = items.filter((item) => !readIds.includes(item.id)).length;
  const loaded = notificationsQuery.isSuccess || notificationsQuery.isError;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-surface/45 transition-all hover:border-copper/25 hover:bg-surface2/55"
        aria-label={t("label")}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="size-4 text-secondary" aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-copper" aria-hidden="true" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border/35 bg-surface/90 p-2 shadow-floating backdrop-blur-xl">
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <p className="text-sm font-semibold text-text">{t("title")}</p>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setReadIds(items.map((item) => item.id))}>
              {t("markAllRead")}
            </Button>
          </div>

          {!loaded ? (
            <div className="space-y-2 px-1 py-2">
              <div className="h-12 rounded-xl border border-border/25 bg-surface2/20" />
              <div className="h-12 rounded-xl border border-border/25 bg-surface2/20" />
              <div className="h-12 rounded-xl border border-border/25 bg-surface2/20" />
            </div>
          ) : notificationsQuery.isError ? (
            <EmptyState className="p-4" title={t("title")} description={t("label")} />
          ) : items.length === 0 ? (
            <EmptyState className="p-4" title={t("title")} description={t("label")} />
          ) : (
            <ul className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isRead = readIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setReadIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))}
                      className={cn(
                        "w-full rounded-xl border px-3 py-2 text-left transition-colors",
                        isRead ? "border-border/20 bg-surface2/20" : "border-border/35 bg-surface2/35 hover:border-copper/20 hover:bg-surface2/50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-surface2/40 text-copper">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="block text-sm font-medium text-text">{item.title}</span>
                            {!isRead && <span className="inline-block h-1.5 w-1.5 rounded-full bg-copper" />}
                          </span>
                          <span className="mt-0.5 block text-xs text-secondary">{item.body}</span>
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
