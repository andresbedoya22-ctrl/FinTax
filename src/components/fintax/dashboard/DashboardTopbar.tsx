"use client";

import { Bell, BellDot, ChevronDown, LayoutGrid, Menu, Navigation2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";

export interface DashboardTopbarProps {
  onOpenSidebar: () => void;
}

export function DashboardTopbar({ onOpenSidebar }: DashboardTopbarProps) {
  const t = useTranslations("Dashboard.topbar");

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0A1628]/90 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label={t("openSidebar")}
        >
          <Menu className="size-5 text-white/60" aria-hidden="true" />
        </button>

        {/* Page title */}
        <h1 className="font-heading text-2xl font-semibold text-white">{t("title")}</h1>

        {/* Case selector */}
        <button
          type="button"
          className="ml-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/70 transition-all hover:bg-white/10 hover:text-white"
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
          {t("currentCase")}
          <ChevronDown className="size-4 text-white/40" aria-hidden="true" />
        </button>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3">
          {/* Bell with red notification dot */}
          <div className="relative">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition-all hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="size-4 text-white/60" aria-hidden="true" />
            </button>
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"
              aria-hidden="true"
            />
          </div>

          {/* Navigation */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition-all hover:bg-white/10"
            aria-label="Navigation"
          >
            <Navigation2 className="size-4 text-white/60" aria-hidden="true" />
          </button>

          {/* BellDot */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition-all hover:bg-white/10"
            aria-label="Alert notifications"
          >
            <BellDot className="size-4 text-white/60" aria-hidden="true" />
          </button>

          {/* Language switcher */}
          <LanguageSwitcher compact />

          {/* User avatar */}
          <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-teal to-green text-xs font-bold text-[#08111E]">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
