"use client";

import { HandCoins, HelpCircle, LayoutDashboard, Receipt, ShieldCheck, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui";
import { useCases } from "@/hooks/useCases";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

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
  const { data: cases } = useCases();
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
  const completedCases = (cases ?? []).filter((c) => c.wizard_completed === true).length;
  const progressWidth = (cases ?? []).length > 0 ? Math.round((completedCases / (cases ?? []).length) * 100) : 0;

  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r border-[#213328] bg-[#0f1914] text-[#e4ede7]",
        className
      )}
    >
      <div className="px-5 py-5">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#2f4d3b] bg-[#153123] text-xs font-black text-[#7ed19f]">
            F
          </div>
          <span className="font-body text-lg font-bold text-[#f3f8f5]">{t("brand")}</span>
        </Link>

        <div className="mt-4 rounded-[var(--radius-lg)] border border-[#2b3e32] bg-[#14231b] px-4 py-3">
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#2f4d3b] bg-[#173325] text-[10px] font-bold text-[#83d6a4]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#f1f7f3]">{displayName}</p>
              <span className="inline-flex items-center rounded-full border border-[#4f4a31] bg-[#2f2b1b] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d8c88f]">
                {profile?.role ?? "user"}
              </span>
            </div>
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#8aa193]" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-[#97ad9f]">Cases completed</span>
              <span className="font-mono text-xs text-[#87d7a7]">{progressWidth}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#0d130f]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1f9e5b] to-[#739f80] transition-all"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-y-auto px-3">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[#91a899]">
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
                  "focus-ring group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "border-[#2f5e45] bg-[#173426] text-[#ecf6f0] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:rounded-full before:bg-[#80d4a2] before:content-['']"
                    : "border-transparent text-[#b8c9bf] hover:border-[#304638] hover:bg-[#162820] hover:text-[#f0f7f3]"
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-[#84d9a6]" : "text-[#89a090] group-hover:text-[#9be5b8]")} aria-hidden="true" />
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
          className={cn(buttonVariants({ variant: "secondary", size: "md" }), "h-auto w-full justify-start rounded-xl border-[#2f493a] bg-[#162920] px-4 py-3 text-[#ecf5ef] hover:bg-[#1c3227]")}
        >
          <HelpCircle className="size-4 text-[#d8c88f]" aria-hidden="true" />
          <span>{t("help")}</span>
        </Link>
      </div>
    </aside>
  );
}
