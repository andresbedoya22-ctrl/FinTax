"use client";

import { FileText, Gift, HelpCircle, LayoutDashboard, Settings, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const navItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "taxReturn", href: "/tax-return", icon: FileText },
  { key: "benefits", href: "/benefits", icon: Gift },
  { key: "settings", href: "/settings", icon: Settings },
  { key: "admin", href: "/admin", icon: ShieldCheck },
] as const;

export interface DashboardSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({ className, onNavigate }: DashboardSidebarProps) {
  const t = useTranslations("Dashboard.sidebar");
  const pathname = usePathname();
  const rawItems = t.raw("items") as
    | string[]
    | {
        dashboard?: string;
        taxReturn?: string;
        benefits?: string;
        settings?: string;
        admin?: string;
      };

  const getLabel = (key: (typeof navItems)[number]["key"], index: number) =>
    Array.isArray(rawItems) ? (rawItems[index] ?? key) : (rawItems[key] ?? key);

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-white/[0.06] bg-[#0A1628]",
        className
      )}
    >
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green to-teal text-xs font-black text-[#08111E]">
            F
          </div>
          <span className="font-heading text-lg font-bold text-white">{t("brand")}</span>
        </Link>

        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-green text-[10px] font-bold text-[#08111E]">
              FT
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{t("profile.name")}</p>
              <p className="truncate text-xs text-muted">{t("profile.role")}</p>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-green" style={{ width: "68%" }} />
          </div>
          <p className="mt-1.5 text-xs text-muted">{t("profile.progress")}</p>
        </div>
      </div>

      <div className="mt-6 overflow-y-auto px-3">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/30">
          {t("sections.main")}
        </p>

        <nav className="space-y-0.5" aria-label={t("sections.main")}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all",
                  isActive ? "bg-white/[0.08] text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{getLabel(item.key, index)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-3 pb-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
        >
          <HelpCircle className="size-4 text-teal" aria-hidden="true" />
          <span>{t("help")}</span>
        </Link>
      </div>
    </aside>
  );
}
