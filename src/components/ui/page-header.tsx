import * as React from "react";

import { cn } from "@/lib/cn";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  leftSlot?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions, leftSlot, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn("border-b border-border/80 bg-surface/95 px-4 py-3 sm:px-6 lg:px-8", className)} {...props}>
      <div className="flex items-center gap-3">
        {leftSlot}
        <div className="min-w-0">
          <h1 className="font-body text-xl font-semibold text-text sm:text-2xl">{title}</h1>
          {subtitle ? <p className="text-xs uppercase tracking-[0.12em] text-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="ml-auto flex items-center gap-2 sm:gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

