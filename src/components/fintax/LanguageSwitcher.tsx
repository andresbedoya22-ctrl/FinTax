"use client";

import { ChevronDown, Languages } from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { Pictogram } from "@/components/ui";

export interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

type LocaleInfo = {
  code: string;
  name: string;
  native: string;
};

const LOCALE_INFO: Record<AppLocale, LocaleInfo> = {
  en: { code: "EN", name: "English", native: "English" },
  es: { code: "ES", name: "Spanish", native: "Espanol" },
  pl: { code: "PL", name: "Polish", native: "Polski" },
  ro: { code: "RO", name: "Romanian", native: "Romana" },
  nl: { code: "NL", name: "Dutch", native: "Nederlands" },
};

const REAL_LOCALES: AppLocale[] = routing.locales.filter((l): l is AppLocale => l !== "nl") as AppLocale[];

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
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
          "focus-ring inline-flex items-center gap-2 rounded-xl border border-border/40 bg-surface/55 text-text transition",
          "hover:border-copper/25 hover:bg-surface/70",
          compact ? "h-10 px-3 text-xs" : "h-11 px-3.5 text-sm"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Change language"
        suppressHydrationWarning
      >
        <span className="grid h-6 w-6 place-items-center rounded-md border border-copper/25 bg-copper/8 text-copper" aria-hidden="true">
          <Languages className="h-3.5 w-3.5" />
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="font-medium tracking-[0.08em] uppercase">{active.code}</span>
          {!compact ? <span className="hidden text-muted sm:inline">{active.native}</span> : null}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted transition-transform", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {mounted && isOpen ? (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full z-50 mt-2 min-w-[248px] overflow-hidden rounded-2xl border border-border/45 bg-surface/95 p-1.5 shadow-panel backdrop-blur-xl"
        >
          <div className="mb-1 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">Supported languages</div>
          <div className="grid gap-1">
            {REAL_LOCALES.map((loc) => {
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
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                    isActive
                      ? "border-green/25 bg-green/8 text-text"
                      : "border-transparent text-secondary hover:border-border/35 hover:bg-white/5 hover:text-text"
                  )}
                >
                  <span className={cn(
                    "inline-flex min-w-10 items-center justify-center rounded-md border px-2 py-1 text-[11px] font-semibold tracking-[0.12em]",
                    isActive ? "border-green/25 bg-green/10 text-green" : "border-border/35 bg-surface2/35 text-muted"
                  )}>
                    {info.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{info.name}</span>
                    <span className="block text-xs text-muted">{info.native}</span>
                  </span>
                  {isActive ? <Pictogram name="check" size={18} decorative className="shrink-0 opacity-90" /> : null}
                </button>
              );
            })}

            <div className="mt-1 flex items-center gap-3 rounded-xl border border-border/25 bg-surface2/25 px-3 py-2.5" aria-disabled="true">
              <span className="inline-flex min-w-10 items-center justify-center rounded-md border border-border/25 px-2 py-1 text-[11px] font-semibold tracking-[0.12em] text-muted opacity-60">NL</span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-secondary">Dutch</span>
                <span className="block text-xs text-muted">Available in selected flows</span>
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
