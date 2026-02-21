import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";

type Messages = Record<string, unknown>;

function deepMerge(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };

  Object.entries(override).forEach(([key, value]) => {
    const baseValue = result[key];
    const bothObjects =
      typeof baseValue === "object" &&
      baseValue !== null &&
      !Array.isArray(baseValue) &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value);

    result[key] = bothObjects
      ? deepMerge(baseValue as Messages, value as Messages)
      : (value as Messages[keyof Messages]);
  });

  return result;
}

async function loadMessages(locale: string): Promise<Messages> {
  switch (locale) {
    case "nl":
      return (await import("../../messages/nl.json")).default as Messages;
    case "es":
      return (await import("../../messages/es.json")).default as Messages;
    case "ro":
      return (await import("../../messages/ro.json")).default as Messages;
    case "pl":
      return (await import("../../messages/pl.json")).default as Messages;
    case "en":
    default:
      return (await import("../../messages/en.json")).default as Messages;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const enMessages = await loadMessages("en");
  const localeMessages = locale === "en" ? {} : await loadMessages(locale);

  return {
    locale,
    messages: deepMerge(enMessages, localeMessages),
  };
});
