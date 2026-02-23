import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl", "es", "ro", "pl"],
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];
