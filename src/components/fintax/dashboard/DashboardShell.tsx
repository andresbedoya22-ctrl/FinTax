"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/fintax/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/fintax/dashboard/DashboardTopbar";
import { Button, SidebarShell } from "@/components/ui";

export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations("Dashboard.topbar");
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const shellRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const current = shellRef.current;
    if (!current) return;
    const nestedParent = current.parentElement?.closest("[data-dashboard-shell='true']");
    if (nestedParent) {
      console.warn("Nested DashboardShell detected. Authenticated routes should render a single shell.");
    }
  }, []);

  React.useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let disposed = false;
    let channelName = "";

    const refreshIfOnline = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      router.refresh();
    };

    const handleOnline = () => refreshIfOnline();
    window.addEventListener("online", handleOnline);

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || disposed) return;

      channelName = `cases:${user.id}`;
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cases",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            if (disposed) return;
            refreshIfOnline();
          }
        )
        .subscribe();

      if (disposed) {
        supabase.removeChannel(channel);
      }
    };

    void setup();

    return () => {
      disposed = true;
      window.removeEventListener("online", handleOnline);
      if (channelName) {
        const channel = supabase.getChannels().find((item) => item.topic === channelName);
        if (channel) supabase.removeChannel(channel);
      }
    };
  }, [router]);

  return (
    <SidebarShell
      ref={shellRef}
      data-dashboard-shell="true"
      className="min-h-screen bg-bg"
      sidebar={<DashboardSidebar />}
      header={<DashboardTopbar onOpenSidebar={() => setIsMobileOpen(true)} />}
      mobileOverlay={
        <div className={cn("lg:hidden", isMobileOpen ? "block" : "hidden")}>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#0f1912]/40"
            onClick={() => setIsMobileOpen(false)}
            aria-label={t("closeOverlay")}
          />
        </div>
      }
      mobileSidebar={
        <div className={cn("lg:hidden", isMobileOpen ? "block" : "hidden")}>
          <div className="fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-80 flex-col bg-surface shadow-floating">
            <div className="flex items-center justify-end border-b border-border/80 p-3">
              <Button type="button" size="icon" variant="ghost" onClick={() => setIsMobileOpen(false)} aria-label={t("closeSidebar")}>
                <X className="size-4" />
              </Button>
            </div>
            <DashboardSidebar className="w-full flex-1" onNavigate={() => setIsMobileOpen(false)} />
          </div>
        </div>
      }
    >
      {children}
    </SidebarShell>
  );
}
