"use client";

import { ChevronDown, Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const t = useTranslations("Common.languages");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as AppLocale;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className={cn("relative", className)}>
      {!compact ? (
        <Globe2
          className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      ) : null}
      <select
        value={locale}
        onChange={onChange}
        className={cn(
          "appearance-none rounded-md border border-border/60 bg-surface2 text-sm text-secondary outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          compact ? "h-8 rounded-full px-2.5 pr-7 text-xs font-medium" : "h-9 pl-8 pr-7",
          className
        )}
        aria-label="Language"
      >
        {routing.locales.map((option) => (
          <option key={option} value={option}>
            {t(option)}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </div>
  );
}
