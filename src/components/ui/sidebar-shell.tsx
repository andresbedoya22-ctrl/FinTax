import * as React from "react";

import { cn } from "@/lib/cn";

export interface SidebarShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  mobileSidebar?: React.ReactNode;
  mobileOverlay?: React.ReactNode;
}

export const SidebarShell = React.forwardRef<HTMLDivElement, SidebarShellProps>(
  ({ sidebar, header, mobileSidebar, mobileOverlay, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("min-h-screen bg-bg", className)} {...props}>
        <div className="flex min-h-screen">
          <div className="hidden lg:block">{sidebar}</div>
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            {header}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-[1440px]">{children}</div>
            </main>
          </div>
        </div>
        {mobileOverlay}
        {mobileSidebar}
      </div>
    );
  },
);

SidebarShell.displayName = "SidebarShell";
