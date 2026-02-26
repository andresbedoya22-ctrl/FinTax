"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { cn } from "@/lib/cn";
import { DashboardSidebar } from "@/components/fintax/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/fintax/dashboard/DashboardTopbar";
import { Button } from "@/components/ui";

export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations("Dashboard.topbar");
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-mesh">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <DashboardTopbar onOpenSidebar={() => setIsMobileOpen(true)} />
          <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>

      <div className={cn("lg:hidden", isMobileOpen ? "block" : "hidden")}>
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#03060c]/70 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-label={t("closeOverlay")}
        />
        <div className="fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-80 flex-col">
          <div className="flex items-center justify-end border-b border-border/40 bg-surface/85 p-3 backdrop-blur-xl">
            <Button type="button" size="icon" variant="ghost" onClick={() => setIsMobileOpen(false)} aria-label={t("closeSidebar")}>
              <X className="size-4" />
            </Button>
          </div>
          <DashboardSidebar className="w-full flex-1" onNavigate={() => setIsMobileOpen(false)} />
        </div>
      </div>
    </div>
  );
}
