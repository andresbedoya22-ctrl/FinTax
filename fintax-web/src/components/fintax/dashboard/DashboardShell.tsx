"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { cn } from "@/lib/cn";
import { DashboardSidebar } from "@/components/fintax/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/fintax/dashboard/DashboardTopbar";

export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations("Dashboard.topbar");
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#08111E]">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <DashboardTopbar onOpenSidebar={() => setIsMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>

      <div className={cn("lg:hidden", isMobileOpen ? "block" : "hidden")}>
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
          aria-label={t("closeOverlay")}
        />
        <div className="fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-80 flex-col">
          <div className="flex items-center justify-end border-b border-border/60 bg-surface/90 p-3">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-md border border-border/70 text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              onClick={() => setIsMobileOpen(false)}
              aria-label={t("closeSidebar")}
            >
              <X className="size-4" />
            </button>
          </div>
          <DashboardSidebar className="w-full flex-1" onNavigate={() => setIsMobileOpen(false)} />
        </div>
      </div>
    </div>
  );
}
