/// <reference types="vitest/globals" />

import { buildLocaleAlternates, buildNoIndexMetadata, buildPublicMetadata } from "@/lib/seo";

describe("seo helpers", () => {
  it("builds locale alternates with x-default", () => {
    expect(buildLocaleAlternates("/legal/privacy", "en")).toEqual({
      canonical: "/en/legal/privacy",
      languages: {
        en: "/en/legal/privacy",
        nl: "/nl/legal/privacy",
        es: "/es/legal/privacy",
        ro: "/ro/legal/privacy",
        pl: "/pl/legal/privacy",
        "x-default": "/en/legal/privacy",
      },
    });
  });

  it("builds public metadata with robots and open graph", () => {
    const metadata = buildPublicMetadata({
      locale: "en",
      pathname: "/",
      title: "Test title",
      description: "Test description",
    });

    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      title: "Test title",
      description: "Test description",
      siteName: "FinTax",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Test title",
    });
  });

  it("builds noindex metadata for private routes", () => {
    const metadata = buildNoIndexMetadata({
      locale: "en",
      pathname: "/dashboard",
      title: "Dashboard",
      description: "Private dashboard",
    });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    });
  });
});
