"use client";

import { Bell, ChevronDown, HelpCircle, Menu } from "lucide-react";
import { useLocale } from "next-intl";

import { FinTaxLogo } from "@/components/fintax/brand";
import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const navByLocale = {
  es: [
    ["Inicio", "/dashboard"],
    ["Ingresos", "/tax-return"],
    ["Gastos", "/tax-return"],
    ["Beneficios / Subsidios", "/benefits"],
    ["Documentos", "/dashboard"],
    ["Historial", "/dashboard"],
  ],
  en: [
    ["Home", "/dashboard"],
    ["Income", "/tax-return"],
    ["Expenses", "/tax-return"],
    ["Benefits", "/benefits"],
    ["Documents", "/dashboard"],
    ["History", "/dashboard"],
  ],
  nl: [
    ["Start", "/dashboard"],
    ["Inkomen", "/tax-return"],
    ["Kosten", "/tax-return"],
    ["Toeslagen", "/benefits"],
    ["Documenten", "/dashboard"],
    ["Historie", "/dashboard"],
  ],
  pl: [
    ["Start", "/dashboard"],
    ["Dochody", "/tax-return"],
    ["Koszty", "/tax-return"],
    ["Świadczenia", "/benefits"],
    ["Dokumenty", "/dashboard"],
    ["Historia", "/dashboard"],
  ],
  ro: [
    ["Acasă", "/dashboard"],
    ["Venituri", "/tax-return"],
    ["Cheltuieli", "/tax-return"],
    ["Beneficii", "/benefits"],
    ["Documente", "/dashboard"],
    ["Istoric", "/dashboard"],
  ],
} as const;

export function TopNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const locale = useLocale() as keyof typeof navByLocale;
  const pathname = usePathname();
  const navItems = navByLocale[locale] ?? navByLocale.en;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#061426]/96 backdrop-blur">
      <div className="mx-auto flex h-[5.25rem] max-w-[1840px] items-center gap-5 px-5 sm:px-8">
        <button
          type="button"
          className="focus-ring grid size-10 place-items-center rounded-full border border-white/12 text-white lg:hidden"
          onClick={onOpenMenu}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <Link href="/" className="focus-ring rounded-xl">
          <FinTaxLogo />
        </Link>
        <nav className="ml-8 hidden flex-1 items-center justify-center gap-8 xl:flex" aria-label="Primary navigation">
          {navItems.map(([label, href]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "relative rounded-md px-1 py-3 text-base font-semibold text-[#C8D2DF] transition-colors hover:text-white",
                  active && "text-[#4CAF50] after:absolute after:inset-x-0 after:-bottom-[1.35rem] after:h-0.5 after:rounded-full after:bg-[#4CAF50]",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher compact />
          <button type="button" className="focus-ring hidden size-10 place-items-center rounded-full border border-white/14 text-[#C8D2DF] hover:text-white sm:grid" aria-label="Help">
            <HelpCircle className="size-5" />
          </button>
          <button type="button" className="focus-ring relative hidden size-10 place-items-center rounded-full border border-white/14 text-[#C8D2DF] hover:text-white sm:grid" aria-label="Notifications">
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2.5 rounded-full bg-[#4CAF50]" />
          </button>
          <button type="button" className="focus-ring flex items-center gap-3 rounded-full text-white" aria-label="Open profile menu">
            <span className="grid size-12 place-items-center rounded-full bg-[#1d314c] text-sm font-bold">FT</span>
            <span className="hidden text-sm font-semibold md:inline">FinTax</span>
            <ChevronDown className="hidden size-4 text-[#C8D2DF] md:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
