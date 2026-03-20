import * as React from "react";

import { cn } from "@/lib/cn";

import { Container } from "./container";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  brand: React.ReactNode;
  nav?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Navbar({ brand, nav, actions, className, ...props }: NavbarProps) {
  return (
    <header className={cn("sticky top-0 z-40 border-b border-border/75 bg-surface/95", className)} {...props}>
      <Container className="flex h-16 items-center gap-4">
        {brand}
        {nav ? <nav className="hidden items-center gap-1 md:flex">{nav}</nav> : null}
        {actions ? <div className="ml-auto flex items-center gap-2 sm:gap-3">{actions}</div> : null}
      </Container>
    </header>
  );
}

