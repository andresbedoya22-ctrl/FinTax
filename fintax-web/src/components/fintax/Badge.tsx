import * as React from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "success" | "warning" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-border/60 bg-surface2 text-secondary",
  success: "border-green/35 bg-green/15 text-green",
  warning: "border-warning/35 bg-warning/15 text-warning",
  info: "border-teal/35 bg-teal/15 text-teal",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
