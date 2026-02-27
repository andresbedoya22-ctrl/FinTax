import type { Metadata } from "next";

import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const DEFAULT_OG_IMAGE = {
  url: "/visuals/app-mock.png",
  width: 1600,
  height: 1000,
  alt: "FinTax platform preview",
};

let hasWarnedMissingAppUrl = false;

function getConfiguredBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    if (process.env.NODE_ENV === "development" && !hasWarnedMissingAppUrl) {
      hasWarnedMissingAppUrl = true;
      console.warn("[seo] NEXT_PUBLIC_APP_URL is not set. Falling back to relative metadata URLs.");
    }
    return undefined;
  }

  return new URL(appUrl);
}

function normalizePathname(pathname: string) {
  if (pathname === "/") return "";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function localizedUrl(locale: AppLocale, pathname: string) {
  return `/${locale}${normalizePathname(pathname)}`;
}

export function buildLocaleAlternates(pathname: string) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, localizedUrl(locale, pathname)]),
  );

  return {
    canonical: localizedUrl(routing.defaultLocale, pathname),
    languages: {
      ...languages,
      "x-default": localizedUrl(routing.defaultLocale, pathname),
    },
  };
}

export interface BuildPublicMetadataOptions {
  locale: AppLocale;
  pathname: string;
  title: string;
  description: string;
  ogImage?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
}

export function buildPublicMetadata({
  locale,
  pathname,
  title,
  description,
  ogImage = DEFAULT_OG_IMAGE,
}: BuildPublicMetadataOptions): Metadata {
  const alternates = buildLocaleAlternates(pathname);
  const metadataBase = getConfiguredBaseUrl();
  const pagePath = localizedUrl(locale, pathname);

  return {
    metadataBase,
    title,
    description,
    alternates,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: "website",
      locale,
      url: pagePath,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export interface BuildNoIndexMetadataOptions {
  locale: AppLocale;
  pathname: string;
  title: string;
  description: string;
}

export function buildNoIndexMetadata({ locale, pathname, title, description }: BuildNoIndexMetadataOptions): Metadata {
  return {
    ...buildPublicMetadata({ locale, pathname, title, description }),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}
