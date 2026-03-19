import type { AppLocale } from "@/i18n/routing";

type PageMetadataCopy = {
  title: string;
  description: string;
};

type PageMetadataMap = Record<
  AppLocale,
  {
    home: PageMetadataCopy;
    auth: PageMetadataCopy;
    taxReturn: PageMetadataCopy;
    benefits: PageMetadataCopy;
    dashboard: PageMetadataCopy;
    privacy: PageMetadataCopy;
    terms: PageMetadataCopy;
  }
>;

const pageMetadata: PageMetadataMap = {
  en: {
    home: {
      title: "FinTax | Dutch tax and benefits guidance for international households",
      description:
        "Premium guidance for Dutch tax returns and benefits workflows with structured intake, human review, and clear case tracking.",
    },
    auth: {
      title: "FinTax | Secure account access",
      description: "Sign in or create an account to access your protected FinTax case workspace.",
    },
    taxReturn: {
      title: "FinTax | Tax return workspace",
      description: "Protected tax return workflow with intake, checklist, and case progression.",
    },
    benefits: {
      title: "FinTax | Benefits workspace",
      description: "Protected benefits workflow with intake, eligibility context, and case tracking.",
    },
    dashboard: {
      title: "FinTax | Client dashboard",
      description: "Protected dashboard for checklist tracking, case updates, and guided next steps.",
    },
    privacy: {
      title: "FinTax | Privacy notice",
      description: "Privacy notice for account access, case handling, document processing, and payments in FinTax.",
    },
    terms: {
      title: "FinTax | Terms of service",
      description: "Terms of service describing FinTax scope, payments, and operational constraints.",
    },
  },
  es: {
    home: {
      title: "FinTax | Soporte para impuestos y subsidios en Paises Bajos",
      description:
        "Orientacion premium para impuestos y subsidios en NL con intake estructurado, revision humana y seguimiento claro del caso.",
    },
    auth: {
      title: "FinTax | Acceso seguro a tu cuenta",
      description: "Inicia sesion o crea una cuenta para entrar en tu espacio protegido de FinTax.",
    },
    taxReturn: {
      title: "FinTax | Espacio de declaracion",
      description: "Flujo protegido de declaracion con intake, checklist y avance del caso.",
    },
    benefits: {
      title: "FinTax | Espacio de subsidios",
      description: "Flujo protegido de subsidios con intake, contexto de elegibilidad y seguimiento.",
    },
    dashboard: {
      title: "FinTax | Dashboard de cliente",
      description: "Dashboard protegido para checklist, actualizaciones del caso y siguientes pasos.",
    },
    privacy: {
      title: "FinTax | Aviso de privacidad",
      description: "Aviso de privacidad para acceso a cuenta, gestion de casos, documentos y pagos en FinTax.",
    },
    terms: {
      title: "FinTax | Terminos del servicio",
      description: "Terminos del servicio que describen alcance, pagos y limites operativos de FinTax.",
    },
  },
  nl: {
    home: {
      title: "FinTax | Hulp bij Nederlandse belasting en toeslagen",
      description:
        "Premium begeleiding voor Nederlandse belasting en toeslagen met gestructureerde intake, menselijke review en duidelijke case tracking.",
    },
    auth: {
      title: "FinTax | Beveiligde accounttoegang",
      description: "Log in of maak een account aan voor je beschermde FinTax workspace.",
    },
    taxReturn: {
      title: "FinTax | Belasting workspace",
      description: "Beschermde belastingflow met intake, checklist en case voortgang.",
    },
    benefits: {
      title: "FinTax | Toeslagen workspace",
      description: "Beschermde toeslagenflow met intake, context en statusopvolging.",
    },
    dashboard: {
      title: "FinTax | Client dashboard",
      description: "Beschermd dashboard voor checklist tracking, case updates en vervolgstappen.",
    },
    privacy: {
      title: "FinTax | Privacyverklaring",
      description: "Privacyverklaring voor accounttoegang, case handling, documentverwerking en betalingen in FinTax.",
    },
    terms: {
      title: "FinTax | Servicevoorwaarden",
      description: "Servicevoorwaarden die scope, betalingen en operationele grenzen van FinTax beschrijven.",
    },
  },
  pl: {
    home: {
      title: "FinTax | Wsparcie dla podatkow i swiadczen w NL",
      description:
        "Premium wsparcie dla podatkow i swiadczen w Niderlandach z uporzadkowanym intake, review specjalisty i jasnym trackingiem sprawy.",
    },
    auth: {
      title: "FinTax | Bezpieczny dostep do konta",
      description: "Zaloguj sie lub utworz konto, aby wejsc do chronionego workspace FinTax.",
    },
    taxReturn: {
      title: "FinTax | Workspace podatkowy",
      description: "Chroniony workflow podatkowy z intake, checklista i postepem sprawy.",
    },
    benefits: {
      title: "FinTax | Workspace swiadczen",
      description: "Chroniony workflow swiadczen z intake, kontekstem i sledzeniem sprawy.",
    },
    dashboard: {
      title: "FinTax | Dashboard klienta",
      description: "Chroniony dashboard dla checklist, aktualizacji sprawy i kolejnych krokow.",
    },
    privacy: {
      title: "FinTax | Polityka prywatnosci",
      description: "Polityka prywatnosci dla konta, obslugi spraw, dokumentow i platnosci w FinTax.",
    },
    terms: {
      title: "FinTax | Warunki uslugi",
      description: "Warunki uslugi opisujace zakres, platnosci i ograniczenia operacyjne FinTax.",
    },
  },
  ro: {
    home: {
      title: "FinTax | Suport pentru taxe si beneficii in Olanda",
      description:
        "Ghidare premium pentru taxe si beneficii in NL cu intake structurat, review uman si urmarire clara a cazului.",
    },
    auth: {
      title: "FinTax | Acces securizat la cont",
      description: "Autentifica-te sau creeaza un cont pentru a intra in workspace-ul protejat FinTax.",
    },
    taxReturn: {
      title: "FinTax | Workspace fiscal",
      description: "Flux fiscal protejat cu intake, checklist si progresul cazului.",
    },
    benefits: {
      title: "FinTax | Workspace beneficii",
      description: "Flux protejat de beneficii cu intake, context de eligibilitate si urmarire.",
    },
    dashboard: {
      title: "FinTax | Dashboard client",
      description: "Dashboard protejat pentru checklist, actualizari de caz si pasii urmatori.",
    },
    privacy: {
      title: "FinTax | Nota de confidentialitate",
      description: "Nota de confidentialitate pentru acces cont, gestionare caz, documente si plati in FinTax.",
    },
    terms: {
      title: "FinTax | Termeni de serviciu",
      description: "Termeni de serviciu care descriu scopul, platile si limitele operationale FinTax.",
    },
  },
};

export function getPageMetadataCopy(locale: AppLocale) {
  return pageMetadata[locale] ?? pageMetadata.en;
}
