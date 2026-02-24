import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        neutral: "border-border/70 bg-surface2/70 text-secondary",
        success: "border-green/35 bg-green/10 text-green-hover",
        copper: "border-copper/35 bg-copper/10 text-[#d5a487]",
        outline: "border-border/50 bg-transparent text-muted",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
