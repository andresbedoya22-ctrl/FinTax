/// <reference types="vitest/globals" />

import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";
import nlMessages from "../../messages/nl.json";
import plMessages from "../../messages/pl.json";
import roMessages from "../../messages/ro.json";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonRecord = { [key: string]: JsonValue };

const locales = {
  en: enMessages as JsonRecord,
  es: esMessages as JsonRecord,
  nl: nlMessages as JsonRecord,
  pl: plMessages as JsonRecord,
  ro: roMessages as JsonRecord,
};

function getKind(value: JsonValue | undefined) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function collectIssues(base: JsonRecord, candidate: JsonRecord, path = ""): string[] {
  const issues: string[] = [];

  for (const [key, value] of Object.entries(candidate)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (!(key in base)) {
      issues.push(`extra key: ${nextPath}`);
      continue;
    }

    const baseValue = base[key] as JsonValue;
    const candidateKind = getKind(value);
    const baseKind = getKind(baseValue);
    if (candidateKind !== baseKind) {
      issues.push(`type mismatch at ${nextPath}: expected ${baseKind}, got ${candidateKind}`);
      continue;
    }

    if (candidateKind === "object") {
      issues.push(...collectIssues(baseValue as JsonRecord, value as JsonRecord, nextPath));
    }
  }

  return issues;
}

describe("messages consistency", () => {
  it("keeps every locale structurally compatible with en", () => {
    for (const [locale, messages] of Object.entries(locales)) {
      if (locale === "en") continue;
      expect(collectIssues(locales.en, messages)).toEqual([]);
    }
  });

  it("keeps dashboard and benefits namespaces present in every locale", () => {
    for (const [locale, messages] of Object.entries(locales)) {
      expect(messages.Dashboard, `Dashboard missing in ${locale}`).toBeDefined();
      expect(messages.Benefits, `Benefits missing in ${locale}`).toBeDefined();
    }
  });
});
