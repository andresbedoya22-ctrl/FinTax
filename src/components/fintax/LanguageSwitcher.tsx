"use client";

import { ChevronDown, Check } from "lucide-react";
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
  name: string;
  native: string;
};

const FLAG_SRCS: Record<string, string> = {
  en: "https://flagcdn.com/w20/gb.png",
  es: "https://flagcdn.com/w20/es.png",
  pl: "https://flagcdn.com/w20/pl.png",
  ro: "https://flagcdn.com/w20/ro.png",
  nl: "https://flagcdn.com/w20/nl.png",
};

function FlagImg({ locale, className }: { locale: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FLAG_SRCS[locale] ?? `https://flagcdn.com/w20/${locale}.png`}
      alt={locale.toUpperCase()}
      width={20}
      height={15}
      crossOrigin="anonymous"
      className={cn("rounded-[2px] object-cover shadow-sm", className)}
      style={{ minWidth: 20 }}
    />
  );
}

const LOCALE_INFO: Record<AppLocale, LocaleInfo> = {
  en: { name: "English", native: "English" },
  es: { name: "Spanish", native: "Español" },
  pl: { name: "Polish", native: "Polski" },
  ro: { name: "Romanian", native: "Română" },
  nl: { name: "Dutch", native: "Nederlands" },
};

const REAL_LOCALES: AppLocale[] = routing.locales.filter(
  (l): l is AppLocale => l !== "nl"
) as AppLocale[];

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nextLocale: AppLocale) => {
    router.replace(pathname, { locale: nextLocale });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-semibold text-white flex items-center gap-2 cursor-pointer hover:bg-white/[0.08] transition-all"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        suppressHydrationWarning
      >
        <FlagImg locale={locale} />
        <span className="uppercase">{locale}</span>
        <ChevronDown
          className="size-4 text-white/60 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        />
      </button>

      {mounted && isOpen && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-2 z-50 bg-[#0f1e30] border border-white/10 rounded-2xl shadow-xl overflow-hidden min-w-[220px]"
        >
          <div className="p-1.5 flex flex-col gap-0.5">
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left w-full transition-colors",
                    isActive
                      ? "bg-green/10 text-green"
                      : "text-white/80 hover:bg-white/5"
                  )}
                >
                  <FlagImg locale={loc} />
                  <span className="flex-1">
                    <span className="font-medium block">{info.name}</span>
                    <span className="text-xs opacity-60">{info.native}</span>
                  </span>
                  {isActive && (
                    <Check className="size-4 text-green shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}

            {/* Coming soon — Dutch */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left w-full cursor-not-allowed"
              aria-disabled="true"
            >
              <FlagImg locale="nl" className="opacity-40" />
              <span className="flex-1 opacity-40">
                <span className="font-medium block text-white/80">
                  {LOCALE_INFO.nl.name}
                </span>
                <span className="text-xs text-white/40">Coming soon</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
