"use client";

import { BellDot, ChevronDown, LayoutGrid, Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";
import { DashboardNotifications } from "@/components/fintax/dashboard/DashboardNotifications";
import { Badge, Button } from "@/components/ui";

export interface DashboardTopbarProps {
  onOpenSidebar: () => void;
}

export function DashboardTopbar({ onOpenSidebar }: DashboardTopbarProps) {
  const t = useTranslations("Dashboard.topbar");

  return (
    <header className="sticky top-0 z-30 border-b border-border/35 bg-bg/70 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label={t("openSidebar")}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>

        <div className="min-w-0">
          <h1 className="font-heading text-xl font-semibold text-text sm:text-2xl">{t("title")}</h1>
          <p className="hidden text-xs uppercase tracking-[0.14em] text-muted sm:block">Authenticated workspace</p>
        </div>

        <button
          type="button"
          className="ml-1 hidden items-center gap-2 rounded-xl border border-border/40 bg-surface/45 px-3 py-2 text-sm text-secondary transition-all hover:border-copper/25 hover:text-text sm:flex"
        >
          <LayoutGrid className="size-4 text-copper" aria-hidden="true" />
          {t("currentCase")}
          <ChevronDown className="size-4 text-muted" aria-hidden="true" />
        </button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <DashboardNotifications />

          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="hidden sm:inline-flex"
            aria-label={t("alerts")}
          >
            <BellDot className="size-4" aria-hidden="true" />
          </Button>

          <LanguageSwitcher compact />

          <button
            type="button"
            className="focus-ring hidden items-center gap-2 rounded-xl border border-border/40 bg-surface/45 px-2.5 py-2 text-left sm:flex"
            aria-label="Open profile menu"
          >
            <div className="grid h-7 w-7 place-items-center rounded-lg border border-green/20 bg-green/10 text-xs font-bold text-green">FT</div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-text">FinTax User</p>
              <p className="text-[11px] text-muted">Profile menu</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
          <Badge variant="neutral" className="sm:hidden">
            FT
          </Badge>
        </div>
      </div>
    </header>
  );
}
