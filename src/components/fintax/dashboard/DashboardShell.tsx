"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { AppShell } from "@/components/fintax/layout";
import { createClient } from "@/lib/supabase/client";

export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
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
    <div ref={shellRef} data-dashboard-shell="true">
      <AppShell>{children}</AppShell>
    </div>
  );
}
