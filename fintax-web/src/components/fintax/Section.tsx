import * as React from "react";

import { cn } from "@/lib/cn";

export type SectionProps = React.HTMLAttributes<HTMLElement>;

export function Section({ className, ...props }: SectionProps) {
  return <section className={cn("py-16 md:py-24", className)} {...props} />;
}
