import * as React from "react";

import { cn } from "@/lib/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

function EmptyState({
  className,
  title,
  description,
  icon,
  action,
  secondaryAction,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "editorial-frame bg-mesh-subtle p-6 md:p-8",
        "flex flex-col items-start gap-5 text-left shadow-panel",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-copper/25 bg-copper/10 text-copper">
          {icon ?? <span className="h-2 w-2 rounded-full bg-copper" />}
        </div>
        <div className="h-px w-14 bg-gradient-to-r from-copper/45 to-transparent" />
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-2xl tracking-[-0.03em] text-text">{title}</h3>
        {description ? <p className="max-w-prose text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action || secondaryAction ? (
        <div className="flex flex-wrap items-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

export { EmptyState };
