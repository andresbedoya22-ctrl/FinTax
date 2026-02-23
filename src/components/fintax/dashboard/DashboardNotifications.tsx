"use client";

import { Bell, CheckCheck, Clock3, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { cn } from "@/lib/cn";

export function DashboardNotifications() {
  const t = useTranslations("Notifications");
  const [open, setOpen] = React.useState(false);
  const [readIds, setReadIds] = React.useState<string[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const items = [
    { id: "1", icon: FileText, title: t("items.docsReview.title"), body: t("items.docsReview.body") },
    { id: "2", icon: Clock3, title: t("items.payment.title"), body: t("items.payment.body") },
    { id: "3", icon: CheckCheck, title: t("items.caseComplete.title"), body: t("items.caseComplete.body") },
  ];

  React.useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const unreadCount = items.filter((item) => !readIds.includes(item.id)).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition-all hover:bg-white/10"
        aria-label={t("label")}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="size-4 text-white/60" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0F1E30] p-2 shadow-xl">
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <p className="text-sm font-semibold text-white">{t("title")}</p>
            <button
              type="button"
              className="text-xs text-teal hover:text-white"
              onClick={() => setReadIds(items.map((item) => item.id))}
            >
              {t("markAllRead")}
            </button>
          </div>
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
                      isRead
                        ? "border-white/5 bg-white/[0.02]"
                        : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-teal">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="block text-sm font-medium text-white">{item.title}</span>
                          {!isRead && <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />}
                        </span>
                        <span className="mt-0.5 block text-xs text-white/60">{item.body}</span>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
