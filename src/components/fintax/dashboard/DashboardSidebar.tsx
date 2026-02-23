"use client";

import {
  BadgeDollarSign,
  ChevronDown,
  FileText,
  Gift,
  LayoutDashboard,
  Landmark,
  Settings,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const navItems = [
  { key: 0, href: "/app", icon: LayoutDashboard, active: true },
  { key: 1, href: "#tax-return", icon: FileText },
  { key: 2, href: "#benefits", icon: Gift },
  { key: 3, href: "#income", icon: BadgeDollarSign },
  { key: 4, href: "#government", icon: Landmark },
  { key: 5, href: "#settings", icon: Settings },
];

export interface DashboardSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({ className, onNavigate }: DashboardSidebarProps) {
  const t = useTranslations("Dashboard.sidebar");
  const labels = t.raw("items") as string[];

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-white/[0.06] bg-[#0A1628]",
        className
      )}
    >
      {/* ── TOP: Logo + profile card ── */}
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green to-teal text-xs font-black text-[#08111E]">
            F
          </div>
          <span className="font-heading text-lg font-bold text-white">{t("brand")}</span>
        </Link>

        {/* Profile / progress card */}
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-green text-xs font-bold text-[#08111E]">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">@1loober</p>
              <p className="truncate text-xs text-muted">Volleat</p>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-green" style={{ width: "85%" }} />
          </div>
          <p className="mt-1.5 text-xs text-muted">Som om ni ve dienen</p>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <div className="mt-6 overflow-y-auto px-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
            Dashboard
          </span>
          <ChevronDown className="size-3.5 text-white/30" aria-hidden="true" />
        </div>

        <nav className="space-y-0.5" aria-label="Sidebar navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all",
                  item.active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{labels[item.key]}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── BOTTOM SECONDARY NAV ── */}
      <div className="mt-auto px-3 pb-2">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
            Meer
          </span>
          <ChevronDown className="size-3.5 text-white/30" aria-hidden="true" />
        </div>

        <nav className="space-y-0.5" aria-label="Secondary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={`secondary-${item.key}`}
                href={item.href}
                onClick={onNavigate}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2 text-xs text-white/40 transition-all hover:bg-white/5 hover:text-white"
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{labels[item.key]}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="mx-3 mb-4 mt-3">
        <button
          type="button"
          className="w-full rounded-xl border border-green/40 bg-green/[0.08] py-2.5 text-sm font-medium text-green transition-all hover:bg-green/[0.15]"
        >
          Controleer alles nogeens
        </button>
      </div>
    </aside>
  );
}
