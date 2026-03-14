import * as React from "react";

import { cn } from "@/lib/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "md" | "lg";
}

const spacingClasses: Record<NonNullable<SectionProps["spacing"]>, string> = {
  sm: "py-10 md:py-12",
  md: "py-14 md:py-16",
  lg: "py-16 md:py-20",
};

export function Section({ className, spacing = "md", ...props }: SectionProps) {
  return <section className={cn(spacingClasses[spacing], className)} {...props} />;
}

