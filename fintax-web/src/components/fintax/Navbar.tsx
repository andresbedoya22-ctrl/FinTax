"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/fintax/Button";
import { Container } from "@/components/fintax/Container";
import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";

const defaultLinks = [
  { key: "product", href: "#product" },
  { key: "pricing", href: "#pricing" },
  { key: "resources", href: "#resources" },
  { key: "contact", href: "#contact" },
] as const;

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  links?: ReadonlyArray<{ key: "product" | "pricing" | "resources" | "contact"; href: string }>;
}

export function Navbar({ className, links = defaultLinks, ...props }: NavbarProps) {
  const t = useTranslations("Navbar");

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b border-border/60 bg-bg/80 backdrop-blur-xl",
        className
      )}
      {...props}
    >
      <Container className="flex h-16 items-center gap-4">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg flex items-center"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green to-teal flex items-center justify-center text-xs font-black text-bg mr-2">
            F
          </div>
          {t("brand")}
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {t(`links.${link.key}`)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <Link
            href="/auth"
            className="rounded-md px-2 py-2 text-sm text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {t("signIn")}
          </Link>

          <Button size="sm">{t("freePrecheck")}</Button>
        </div>
      </Container>
    </header>
  );
}
