import * as React from "react";

import { TopNav } from "@/components/fintax/layout/TopNav";
import { cn } from "@/lib/cn";

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-[#061426] text-white">
      <TopNav />
      <main className={cn("mx-auto w-full max-w-[1840px] px-5 py-7 sm:px-8 lg:py-10", className)}>
        {children}
      </main>
    </div>
  );
}
