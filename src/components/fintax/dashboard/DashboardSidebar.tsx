"use client";

import { HandCoins, HelpCircle, LayoutDashboard, Receipt, ShieldCheck, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { mockCases } from "@/lib/mock-data";

const navItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "taxReturn", href: "/tax-return", icon: Receipt },
  { key: "benefits", href: "/benefits", icon: HandCoins },
  { key: "settings", href: "/settings", icon: SlidersHorizontal },
  { key: "admin", href: "/admin", icon: ShieldCheck },
] as const;

export interface DashboardSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({ className, onNavigate }: DashboardSidebarProps) {
  const t = useTranslations("Dashboard.sidebar");
  const locale = useLocale();
  const pathname = usePathname();
  const { profile } = useCurrentProfile();
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

  const visibleNavItems = navItems.filter((item) => item.key !== "admin" || profile?.role === "admin");
  const fallbackName = locale === "nl" ? "FinTax klant" : locale === "es" ? "Cliente FinTax" : locale === "pl" ? "Klient FinTax" : locale === "ro" ? "Client FinTax" : "FinTax client";
  const displayName = (profile?.full_name || "").trim() || fallbackName;
  const words = displayName.split(/\s+/).filter(Boolean);
  const initials =
    words.length === 0
      ? "FT"
      : words.length === 1
        ? (words[0]![0]?.toUpperCase() ?? "FT")
        : ((words[0]![0]?.toUpperCase() ?? "") + (words[words.length - 1]![0]?.toUpperCase() ?? ""));
  const completedCases = mockCases.filter((c) => c.wizard_completed === true).length;
  const progressWidth = mockCases.length > 0 ? Math.round((completedCases / mockCases.length) * 100) : 0;

  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r border-border/35 bg-surface/70 backdrop-blur-xl",
        className
      )}
    >
      <div className="px-5 py-5">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-copper/30 bg-copper/10 text-xs font-black text-copper">
            F
          </div>
          <span className="font-heading text-lg font-bold text-text">{t("brand")}</span>
        </Link>

        <div className="editorial-frame mt-4 rounded-[var(--radius-lg)] bg-surface2/35 px-4 py-3">
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-green/20 bg-green/10 text-[10px] font-bold text-green">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text">{displayName}</p>
              <span className="inline-flex items-center rounded-full border border-copper/30 bg-copper/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-copper">
                {profile?.role ?? "user"}
              </span>
            </div>
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted">Cases completed</span>
              <span className="font-mono text-xs text-green">{progressWidth}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green to-copper transition-all"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-y-auto px-3">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted">
          {t("sections.main")}
        </p>

        <nav className="space-y-0.5" aria-label={t("sections.main")}>
          {visibleNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border px-4 py-2.5 text-sm transition-all",
                  isActive
                    ? "border-copper/25 bg-copper/[0.08] text-text shadow-glass-soft before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:rounded-full before:bg-copper before:content-['']"
                    : "border-transparent text-secondary hover:border-border/35 hover:bg-white/5 hover:text-text"
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-copper" : "text-muted group-hover:text-green")} aria-hidden="true" />
                <span>{getLabel(item.key, index)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-3 px-3 pb-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn(buttonVariants({ variant: "secondary", size: "md" }), "h-auto w-full justify-start rounded-xl px-4 py-3")}
        >
          <HelpCircle className="size-4 text-copper" aria-hidden="true" />
          <span>{t("help")}</span>
        </Link>
      </div>
    </aside>
  );
}
