"use client";

import { BellDot, ChevronDown, LayoutGrid, Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";
import { DashboardNotifications } from "@/components/fintax/dashboard/DashboardNotifications";

export interface DashboardTopbarProps {
  onOpenSidebar: () => void;
}

export function DashboardTopbar({ onOpenSidebar }: DashboardTopbarProps) {
  const t = useTranslations("Dashboard.topbar");

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0A1628]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] lg:hidden"
          onClick={onOpenSidebar}
          aria-label={t("openSidebar")}
        >
          <Menu className="size-5 text-white/70" aria-hidden="true" />
        </button>

        <h1 className="font-heading text-xl font-semibold text-white sm:text-2xl">{t("title")}</h1>

        <button
          type="button"
          className="ml-1 hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/70 transition-all hover:bg-white/10 hover:text-white sm:flex"
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
          {t("currentCase")}
          <ChevronDown className="size-4 text-white/40" aria-hidden="true" />
        </button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <DashboardNotifications />

          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition-all hover:bg-white/10 sm:flex"
            aria-label={t("alerts")}
          >
            <BellDot className="size-4 text-white/60" aria-hidden="true" />
          </button>

          <LanguageSwitcher compact />

          <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-teal to-green text-xs font-bold text-[#08111E]">
            FT
          </div>
        </div>
      </div>
    </header>
  );
}
