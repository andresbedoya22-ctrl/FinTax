"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Button, Navbar as UiNavbar } from "@/components/ui";
import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";

const defaultLinks = [
  { key: "product", href: "#services" },
  { key: "pricing", href: "#pricing" },
  { key: "resources", href: "#faq" },
  { key: "contact", href: "/legal/privacy" },
] as const;

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  links?: ReadonlyArray<{ key: "product" | "pricing" | "resources" | "contact"; href: string }>;
}

export function Navbar({ className, links = defaultLinks, ...props }: NavbarProps) {
  const t = useTranslations("Navbar");

  return (
    <UiNavbar
      className={cn("border-border/75 bg-surface/95", className)}
      brand={
        <Link href="/" className="focus-ring inline-flex items-center rounded-md text-text">
          <span className="mr-2 grid h-7 w-7 place-items-center rounded-lg border border-green/35 bg-green/10 text-xs font-black text-green">
            F
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">{t("brand")}</span>
        </Link>
      }
      nav={
        <>
          {links.map((link) => (
            <Link key={link.key} href={link.href} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">
              {t(`links.${link.key}`)}
            </Link>
          ))}
        </>
      }
      actions={
        <>
          <LanguageSwitcher />
          <Link href="/auth" className="focus-ring rounded-md px-2 py-2 text-sm text-secondary hover:text-text">
            {t("signIn")}
          </Link>
          <Button asChild size="sm">
            <Link href="/auth?intent=tax-return">{t("freePrecheck")}</Link>
          </Button>
        </>
      }
      {...props}
    />
  );
}
