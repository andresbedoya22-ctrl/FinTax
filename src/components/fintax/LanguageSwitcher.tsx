"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

type LocaleInfo = {
  code: string;
  name: string;
  native: string;
  flag: "gb" | "es" | "nl" | "pl" | "ro";
};

const LOCALE_INFO: Record<AppLocale, LocaleInfo> = {
  en: { code: "EN", name: "English", native: "English", flag: "gb" },
  es: { code: "ES", name: "Spanish", native: "Espanol", flag: "es" },
  nl: { code: "NL", name: "Dutch", native: "Nederlands", flag: "nl" },
  pl: { code: "PL", name: "Polish", native: "Polski", flag: "pl" },
  ro: { code: "RO", name: "Romanian", native: "Romana", flag: "ro" },
};

const SUPPORTED_LOCALES: AppLocale[] = [...routing.locales] as AppLocale[];

function FlagIcon({ flag }: { flag: LocaleInfo["flag"] }) {
  if (flag === "es") {
    return (
      <svg viewBox="0 0 28 20" aria-hidden="true" className="h-4 w-5 rounded-[3px] border border-black/10">
        <rect width="28" height="20" fill="#C60B1E" />
        <rect y="5" width="28" height="10" fill="#FFC400" />
      </svg>
    );
  }

  if (flag === "nl") {
    return (
      <svg viewBox="0 0 28 20" aria-hidden="true" className="h-4 w-5 rounded-[3px] border border-black/10">
        <rect width="28" height="20" fill="#FFFFFF" />
        <rect width="28" height="6.66" fill="#AE1C28" />
        <rect y="13.34" width="28" height="6.66" fill="#21468B" />
      </svg>
    );
  }

  if (flag === "pl") {
    return (
      <svg viewBox="0 0 28 20" aria-hidden="true" className="h-4 w-5 rounded-[3px] border border-black/10">
        <rect width="28" height="20" fill="#FFFFFF" />
        <rect y="10" width="28" height="10" fill="#DC143C" />
      </svg>
    );
  }

  if (flag === "ro") {
    return (
      <svg viewBox="0 0 28 20" aria-hidden="true" className="h-4 w-5 rounded-[3px] border border-black/10">
        <rect width="9.33" height="20" fill="#002B7F" />
        <rect x="9.33" width="9.34" height="20" fill="#FCD116" />
        <rect x="18.67" width="9.33" height="20" fill="#CE1126" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 28 20" aria-hidden="true" className="h-4 w-5 rounded-[3px] border border-black/10">
      <rect width="28" height="20" fill="#1F4AA9" />
      <rect x="11" width="6" height="20" fill="#FFFFFF" />
      <rect y="7" width="28" height="6" fill="#FFFFFF" />
      <rect x="12" width="4" height="20" fill="#C8102E" />
      <rect y="8" width="28" height="4" fill="#C8102E" />
    </svg>
  );
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const active = LOCALE_INFO[locale] ?? LOCALE_INFO.en;

  const handleSelect = (nextLocale: AppLocale) => {
    router.replace(pathname, { locale: nextLocale });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "focus-ring inline-flex items-center gap-2 rounded-full border border-border/45 bg-white/88 text-text transition duration-200",
          "hover:border-green/45 hover:bg-white",
          compact ? "h-9 px-2.5 text-xs" : "h-10 px-3 text-sm"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Change language, current ${active.name}`}
      >
        <FlagIcon flag={active.flag} />
        {!compact ? <span className="font-medium text-secondary">{active.code}</span> : null}
        <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
        <span className="sr-only">Change language</span>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full z-50 mt-2 min-w-[238px] overflow-hidden rounded-2xl border border-border/50 bg-white p-1.5 shadow-[0_16px_38px_rgba(10,20,14,0.12)]"
        >
          <div className="mb-1 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">Languages</div>
          <div className="grid gap-1">
            {SUPPORTED_LOCALES.map((loc) => {
              const info = LOCALE_INFO[loc];
              const isActive = loc === locale;
              return (
                <button
                  key={loc}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(loc)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition duration-200",
                    isActive
                      ? "border-green/35 bg-green/8 text-text"
                      : "border-transparent text-secondary hover:border-green/25 hover:bg-green/5 hover:text-text"
                  )}
                >
                  <FlagIcon flag={info.flag} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{info.name}</span>
                    <span className="block text-xs text-muted">{info.native}</span>
                  </span>
                  {isActive ? <Check className="h-4 w-4 text-green" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
