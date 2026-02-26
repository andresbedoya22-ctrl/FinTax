"use client";

import { ChevronDown, Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";
import { DashboardNotifications } from "@/components/fintax/dashboard/DashboardNotifications";
import { Badge, Button, Skeleton } from "@/components/ui";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

export interface DashboardTopbarProps {
  onOpenSidebar: () => void;
}

export function DashboardTopbar({ onOpenSidebar }: DashboardTopbarProps) {
  const t = useTranslations("Dashboard.topbar");
  const locale = useLocale();
  const { profile, loading } = useCurrentProfile();
  const fallbackName = locale === "nl" ? "FinTax klant" : locale === "es" ? "Cliente FinTax" : locale === "pl" ? "Klient FinTax" : locale === "ro" ? "Client FinTax" : "FinTax client";
  const displayName = (profile?.full_name || "").trim() || fallbackName;
  const words = displayName.split(/\s+/).filter(Boolean);
  const initials =
    words.length === 0
      ? "FT"
      : words.length === 1
        ? (words[0]![0]?.toUpperCase() ?? "FT")
        : ((words[0]![0]?.toUpperCase() ?? "") + (words[words.length - 1]![0]?.toUpperCase() ?? ""));

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

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <DashboardNotifications />

          <LanguageSwitcher compact />

          <button
            type="button"
            className="focus-ring hidden items-center gap-2 rounded-xl border border-border/40 bg-surface/45 px-2.5 py-2 text-left sm:flex"
            aria-label="Open profile menu"
          >
            <div className="grid h-7 w-7 place-items-center rounded-lg border border-green/20 bg-green/10 text-xs font-bold text-green">{initials}</div>
            {loading ? (
              <div className="hidden flex-col gap-1.5 md:flex">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-2.5 w-32 rounded" />
              </div>
            ) : (
              <div className="hidden md:block">
                <p className="text-xs font-medium text-text">{displayName}</p>
                <p className="text-[11px] text-muted">{profile?.email ?? ""}</p>
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
          <Badge variant="neutral" className="sm:hidden">
            {initials}
          </Badge>
        </div>
      </div>
    </header>
  );
}
