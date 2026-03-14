import * as React from "react";

import { cn } from "@/lib/cn";

import { Container } from "./container";

export type FooterProps = React.HTMLAttributes<HTMLElement>;

export function Footer({ className, children, ...props }: FooterProps) {
  return (
    <footer className={cn("border-t border-border/80 bg-surface2/70", className)} {...props}>
      <Container className="py-14">{children}</Container>
    </footer>
  );
}
