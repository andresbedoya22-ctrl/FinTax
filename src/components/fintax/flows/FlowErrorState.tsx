"use client";

import { AlertTriangle } from "lucide-react";

import { isApiClientError } from "@/hooks/api-client";

type FlowKind = "dashboard" | "benefits" | "tax-return" | "admin" | "settings";

const flowCopy: Record<FlowKind, { title: string; descriptions: Record<string, string>; fallback: string }> = {
  dashboard: {
    title: "Dashboard data kon niet worden geladen",
    descriptions: {
      unauthorized: "Je sessie is verlopen. Log opnieuw in om je cases en meldingen te zien.",
      forbidden: "Je account mist toegang tot deze dashboardgegevens.",
      not_found: "De gevraagde dashboardinformatie bestaat niet meer.",
      internal: "De server reageerde niet op tijd. Probeer het over enkele seconden opnieuw.",
    },
    fallback: "Er ging iets mis bij het ophalen van je dashboardinformatie.",
  },
  benefits: {
    title: "Toeslagenflow tijdelijk niet beschikbaar",
    descriptions: {
      unauthorized: "Je sessie is verlopen. Log opnieuw in om je toeslagenaanvraag te hervatten.",
      invalid_payload: "Een invoer in je toeslagenformulier is ongeldig. Controleer je laatste stap.",
      conflict: "Deze aanvraag is al gewijzigd in een andere sessie. Vernieuw en controleer de status.",
      internal: "De berekening voor toeslagen kon niet worden afgerond. Probeer opnieuw.",
    },
    fallback: "We konden de toeslagengegevens nu niet ophalen.",
  },
  "tax-return": {
    title: "Aangifteflow kon niet laden",
    descriptions: {
      unauthorized: "Je sessie is verlopen. Log opnieuw in om je aangifte verder te zetten.",
      invalid_payload: "Er staat ongeldige invoer in het aangifteformulier. Controleer je gegevens.",
      not_found: "Deze aangiftecase is niet gevonden of is verwijderd.",
      internal: "De aangifteservice geeft nu geen reactie. Probeer het opnieuw.",
    },
    fallback: "Je aangiftedata kon op dit moment niet worden geladen.",
  },
  admin: {
    title: "Adminwerkruimte niet beschikbaar",
    descriptions: {
      unauthorized: "Je sessie is verlopen. Log opnieuw in als admin.",
      forbidden: "Je account heeft geen adminrechten voor deze actie.",
      internal: "De admin API geeft nu geen geldige response. Probeer opnieuw.",
    },
    fallback: "Admingegevens konden nu niet worden opgehaald.",
  },
  settings: {
    title: "Instellingen konden niet worden geladen",
    descriptions: {
      unauthorized: "Je sessie is verlopen. Log opnieuw in om je instellingen te bekijken.",
      invalid_payload: "Een instellingenwaarde is ongeldig. Controleer de invoer en probeer opnieuw.",
      internal: "De instellingenservice reageert nu niet. Probeer het over enkele seconden opnieuw.",
    },
    fallback: "Je instellingen zijn nu tijdelijk niet beschikbaar.",
  },
};

function resolveErrorCode(error: Error) {
  if (isApiClientError(error)) return String(error.code);
  return "internal";
}

export function FlowErrorState({ flow, error, onRetry }: { flow: FlowKind; error: Error; onRetry: () => void }) {
  const copy = flowCopy[flow];
  const code = resolveErrorCode(error);
  const description = copy.descriptions[code] ?? copy.fallback;

  return (
    <div className="rounded-[var(--radius-xl)] border border-copper/30 bg-copper/10 p-6 shadow-panel">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-copper/35 bg-copper/15 text-copper">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.14em] text-copper">Error code: {code}</p>
          <h2 className="font-heading text-2xl tracking-[-0.02em] text-text">{copy.title}</h2>
          <p className="text-sm leading-6 text-secondary">{description}</p>
          <button type="button" onClick={onRetry} className="focus-ring rounded-full border border-copper/35 bg-copper/15 px-4 py-2 text-sm font-semibold text-copper transition-colors hover:border-copper/50">
            Opnieuw proberen
          </button>
        </div>
      </div>
    </div>
  );
}
