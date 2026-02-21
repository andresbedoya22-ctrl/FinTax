"use client";

import { Bell, ChevronDown, Menu, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";
import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";

export interface DashboardTopbarProps {
  onOpenSidebar: () => void;
}

export function DashboardTopbar({ onOpenSidebar }: DashboardTopbarProps) {
  const t = useTranslations("Dashboard.topbar");

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border/70 bg-surface2 text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg lg:hidden"
          onClick={onOpenSidebar}
          aria-label={t("openSidebar")}
        >
          <Menu className="size-5" />
        </button>

        <h1 className="font-heading text-2xl font-semibold text-text">{t("title")}</h1>

        <button
          type="button"
          className="ml-2 inline-flex items-center gap-2 rounded-md border border-border/70 bg-surface2 px-3 py-2 text-sm text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {t("currentCase")}
          <ChevronDown className="size-4" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" className="!px-2.5">
            <Bell className="size-4" aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="!px-2.5">
            <Settings className="size-4" aria-hidden="true" />
          </Button>
          <LanguageSwitcher compact />
        </div>
      </div>
    </header>
  );
}
