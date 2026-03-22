import type { Metadata } from "next";

import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const DEFAULT_OG_IMAGE = {
  url: "/visuals/app-mock.png",
  width: 1600,
  height: 1000,
  alt: "FinTax platform preview",
};
const LOCAL_DEV_APP_URL = "http://localhost:3000";

let hasWarnedMissingAppUrl = false;

declare global {
  // Prevent repeated dev-only SEO warnings across hot reload/module re-evaluation.
  var __fintaxSeoWarnedMissingAppUrl__: boolean | undefined;
}

export function getConfiguredBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) {
    return process.env.NODE_ENV === "development" ? new URL(LOCAL_DEV_APP_URL) : undefined;
  }

  try {
    return new URL(appUrl);
  } catch {
    const alreadyWarned = hasWarnedMissingAppUrl || globalThis.__fintaxSeoWarnedMissingAppUrl__ === true;
    if (!alreadyWarned) {
      hasWarnedMissingAppUrl = true;
      globalThis.__fintaxSeoWarnedMissingAppUrl__ = true;
      console.warn(`[seo] Ignoring invalid NEXT_PUBLIC_APP_URL value: ${appUrl}`);
    }

    return process.env.NODE_ENV === "development" ? new URL(LOCAL_DEV_APP_URL) : undefined;
  }
}

function normalizePathname(pathname: string) {
  if (pathname === "/") return "";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function localizedUrl(locale: AppLocale, pathname: string) {
  return `/${locale}${normalizePathname(pathname)}`;
}

export function buildAbsoluteUrl(pathname: string) {
  const normalizedPath = pathname === "/" ? "/" : normalizePathname(pathname);
  const metadataBase = getConfiguredBaseUrl();
  return metadataBase ? new URL(normalizedPath, metadataBase).toString() : normalizedPath;
}

export function buildLocaleAlternates(pathname: string, locale: AppLocale) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, localizedUrl(locale, pathname)]),
  );

  return {
    canonical: localizedUrl(locale, pathname),
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
  keywords?: string[];
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
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
}: BuildPublicMetadataOptions): Metadata {
  const alternates = buildLocaleAlternates(pathname, locale);
  const metadataBase = getConfiguredBaseUrl();
  const pagePath = localizedUrl(locale, pathname);

  return {
    metadataBase,
    title,
    description,
    keywords,
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
      siteName: "FinTax",
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      site: "@fintax",
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
