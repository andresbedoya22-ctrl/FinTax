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

function caseStatusLabel(status: string) {
  switch (status) {
    case "pending_documents":
      return "Pending docs";
    case "in_review":
      return "In review";
    case "pending_payment":
      return "Pending payment";
    case "pending_authorization":
      return "Pending auth";
    case "authorized":
      return "Authorized";
    case "submitted":
      return "Submitted";
    case "completed":
      return "Completed";
    case "rejected":
      return "Needs update";
    default:
      return "Draft";
  }
}

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
  const activeCase = cases?.[0] ?? null;
  const activeYear = activeCase?.tax_year ?? new Date().getFullYear();
  const activeStatus = caseStatusLabel(activeCase?.status ?? "draft");

  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r border-[#1f3529] bg-gradient-to-b from-[#102318] via-[#0f1a14] to-[#0b140f] text-[#e4ede7]",
        className
      )}
    >
      <div className="px-5 py-5">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#345442] bg-[#163626] text-xs font-black text-[#94dfb3]">
            F
          </div>
          <span className="font-body text-lg font-bold text-[#f3f8f5]">{t("brand")}</span>
        </Link>
      </div>

      <div className="mt-2 overflow-y-auto px-3">
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
                  "focus-ring group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border px-4 py-2.5 text-[0.94rem] transition-colors",
                  isActive
                    ? "border-[#3f7155] bg-[#1a3b2a] text-[#ecf6f0] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:rounded-full before:bg-[#8ad4aa] before:content-['']"
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
        <div className="rounded-[var(--radius-lg)] border border-[#2c4a38] bg-[#163526] px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#f1f8f4]">Tax year {activeYear}</p>
            <span className="font-mono text-xs text-[#d7ebdf]">{progressWidth}%</span>
          </div>
          <p className="text-xs text-[#b6c9bf]">Status: {activeStatus}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0c140f]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1f9e5b] to-[#7fb894] transition-all"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn(buttonVariants({ variant: "secondary", size: "md" }), "h-auto w-full justify-start rounded-xl border-[#2f493a] bg-[#162920] px-4 py-3 text-[#ecf5ef] hover:bg-[#1c3227]")}
        >
          <HelpCircle className="size-4 text-[#d8c88f]" aria-hidden="true" />
          <span>{t("help")}</span>
        </Link>

        <button
          type="button"
          className="focus-ring flex w-full items-center gap-2 rounded-xl border border-[#2c4034] bg-[#13231b] px-3 py-2.5 text-left"
          aria-label="Open profile menu"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#2f4d3b] bg-[#173325] text-[10px] font-bold text-[#83d6a4]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#f1f7f3]">{displayName}</p>
            <span className="text-[11px] text-[#97ad9f]">{profile?.role ?? "user"}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#8aa193]" />
        </button>
      </div>
    </aside>
  );
}
