import { ChevronDown, Globe } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/fintax/Button";
import { Container } from "@/components/fintax/Container";

const defaultLinks = [
  { label: "Product", href: "#product" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
  { label: "Contact", href: "#contact" },
];

const languages = ["EN", "NL", "ES", "RO", "PL"] as const;

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  links?: Array<{ label: string; href: string }>;
}

export function Navbar({ className, links = defaultLinks, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-xl",
        className
      )}
      {...props}
    >
      <Container className="flex h-16 items-center gap-4">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          FinTax
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <label htmlFor="language" className="sr-only">
              Language
            </label>
            <Globe
              className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <select
              id="language"
              name="language"
              defaultValue="EN"
              className="h-9 appearance-none rounded-md border border-border/60 bg-surface2 pl-8 pr-7 text-sm text-secondary outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
          </div>

          <Link
            href="/signin"
            className="rounded-md px-2 py-2 text-sm text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Sign in
          </Link>

          <Button size="sm">Free precheck</Button>
        </div>
      </Container>
    </header>
  );
}
