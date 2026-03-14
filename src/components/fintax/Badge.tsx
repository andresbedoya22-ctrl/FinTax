import * as React from "react";

import { cn } from "@/lib/cn";
import { Badge as UiBadge } from "@/components/ui";

type BadgeVariant = "neutral" | "success" | "warning" | "info";

const variantMap = {
  neutral: "neutral",
  success: "success",
  warning: "copper",
  info: "outline",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return <UiBadge className={cn(className)} variant={variantMap[variant]} {...props} />;
}
