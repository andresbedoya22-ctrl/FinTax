import type { AppLocale } from "@/i18n/routing";

export type LandingIntent = "tax-return" | "benefits";

export type LandingContent = {
  nav: {
    howItWorks: string;
    services: string;
    pricing: string;
    faq: string;
    resources: string;
  };
  actions: {
    signIn: string;
    getStarted: string;
    seeFlow: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    microcopy: string;
    panelLabel: string;
    panelTitle: string;
    panelBody: string;
    panelPoints: string[];
    stats: { label: string; value: string }[];
  };
  trustStrip: string[];
  howItWorks: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: { title: string; body: string }[];
  };
  services: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { title: string; body: string; intent: LandingIntent }[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    note: string;
    featuredLabel: string;
    plans: {
      name: string;
      price: string;
      summary: string;
      features: string[];
      cta: string;
      intent: LandingIntent;
      featured?: boolean;
    }[];
  };
  proof: {
    eyebrow: string;
    title: string;
    items: { title: string; body: string }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { question: string; answer: string }[];
  };
  resources: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { tag: string; title: string; body: string; href: string; cta: string }[];
  };
  finalCta: {
    eyebrow: string;
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
  };
  footer: {
    legalTitle: string;
    legalBody: string;
    legalLinksTitle: string;
    languagesTitle: string;
    navigationTitle: string;
    privacy: string;
    terms: string;
    taxReturn: string;
    benefits: string;
  };
};

const landingContent: Record<AppLocale, LandingContent> = {
  en: {
    nav: {
      howItWorks: "How it works",
      services: "Services",
      pricing: "Pricing",
      faq: "FAQ",
      resources: "Resources",
    },
    actions: {
      signIn: "Sign in",
      getStarted: "Start secure intake",
      seeFlow: "See the guided flow",
    },
    hero: {
      eyebrow: "Structured Dutch tax and benefits support",
      title: "A premium workspace for tax returns and benefits in the Netherlands.",
      body:
        "FinTax helps international households move through Dutch tax and benefits processes with one guided intake, human review, and clear case tracking.",
      primaryCta: "Start tax return intake",
      secondaryCta: "See how FinTax works",
      microcopy:
        "No refund guarantees. Scope and next steps are clarified before case execution.",
      panelLabel: "Case workspace",
      panelTitle: "One place for intake, review, and case progress.",
      panelBody:
        "Upload documents, respond to checklist requests, and follow the status of each tax or benefits case without switching between channels.",
      panelPoints: [
        "Guided intake for taxes and benefits",
        "Human review before filing or submission support",
        "Checklist and status updates in the client workspace",
      ],
      stats: [
        { label: "Coverage", value: "Tax returns" },
        { label: "Coverage", value: "Benefits" },
        { label: "Process", value: "Human review" },
      ],
    },
    trustStrip: [
      "Multilingual support",
      "Guided case intake",
      "Human review",
      "Status tracking",
      "Protected account routes",
    ],
    howItWorks: {
      eyebrow: "How FinTax works",
      title: "Three clear steps from intake to follow-through.",
      intro:
        "The process is designed to reduce ambiguity for international users while keeping each case structured and reviewable.",
      steps: [
        {
          title: "Share your information and documents",
          body: "Start with secure intake, provide case context, and upload the documents you already have.",
        },
        {
          title: "Review and validation",
          body: "A specialist reviews the file, flags missing items, and confirms what can move forward.",
        },
        {
          title: "Track progress and execution",
          body: "Follow checklist updates, case status, and next actions from the authenticated workspace.",
        },
      ],
    },
    services: {
      eyebrow: "Services",
      title: "Built around real tax and benefits workflows.",
      intro:
        "FinTax stays focused on the operational work users need for Dutch tax returns, benefits support, and guided case handling.",
      items: [
        {
          title: "Dutch tax returns",
          body: "Guided support for common filing routes, document collection, and case progression.",
          intent: "tax-return",
        },
        {
          title: "Benefits guidance",
          body: "Structured support for eligibility context, intake, and follow-up for Dutch benefits cases.",
          intent: "benefits",
        },
        {
          title: "Case handling",
          body: "A client workspace for checklist management, operational review, and clear next-step visibility.",
          intent: "tax-return",
        },
        {
          title: "Document and status support",
          body: "Keep files, requests, and case milestones organized in one place throughout the process.",
          intent: "benefits",
        },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Clear plans with scope confirmed before work begins.",
      note:
        "Representative pricing for common cases. Complex scenarios can require a scoped quote.",
      featuredLabel: "Most common",
      plans: [
        {
          name: "Return",
          price: "From EUR 149",
          summary: "For straightforward annual return cases with guided intake.",
          features: ["Structured intake", "Document checklist", "Case status tracking"],
          cta: "Start return intake",
          intent: "tax-return",
        },
        {
          name: "Return + Review",
          price: "From EUR 199",
          summary: "For the most common filing cases that need deeper review before submission support.",
          features: ["Human review", "Checklist follow-up", "Case workspace updates"],
          cta: "Choose guided review",
          intent: "tax-return",
          featured: true,
        },
        {
          name: "Benefits",
          price: "From EUR 39",
          summary: "For benefits-related intake, guidance, and case handling support.",
          features: ["Benefits intake", "Eligibility context capture", "Progress visibility"],
          cta: "Start benefits intake",
          intent: "benefits",
        },
      ],
    },
    proof: {
      eyebrow: "Operational trust",
      title: "Proof grounded in process, not marketing claims.",
      items: [
        {
          title: "Protected access",
          body: "Authenticated routes and account access are separated from public pages.",
        },
        {
          title: "Human review",
          body: "Cases are reviewed by a specialist before filing or guided submission support.",
        },
        {
          title: "Structured follow-through",
          body: "Checklist requests and status changes remain visible in the client workspace.",
        },
        {
          title: "Focused scope",
          body: "FinTax is positioned around Dutch taxes and benefits rather than broad generic finance claims.",
        },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Common questions before you start.",
      items: [
        {
          question: "Can I begin before I have every document ready?",
          answer: "Yes. You can start intake first and upload additional files later when the checklist requires them.",
        },
        {
          question: "Does FinTax guarantee a refund or outcome?",
          answer: "No. Outcomes depend on the case facts, provided documents, and the relevant Dutch authority assessment.",
        },
        {
          question: "Can I track what happens after intake?",
          answer: "Yes. The authenticated workspace is designed to show checklist progress, case status, and next actions.",
        },
        {
          question: "Is the service only for tax returns?",
          answer: "No. FinTax also covers benefits-related guidance and case handling for users navigating Dutch support flows.",
        },
      ],
    },
    resources: {
      eyebrow: "Resources",
      title: "Public pages that explain scope and process.",
      intro:
        "FinTax keeps public resources concise and factual. When broader editorial content is added later, it should follow the same evidence standard.",
      items: [
        {
          tag: "Legal",
          title: "Privacy notice",
          body: "How account, case, payment, and document data are handled in the product.",
          href: "/legal/privacy",
          cta: "Read privacy notice",
        },
        {
          tag: "Legal",
          title: "Terms of service",
          body: "Scope, payments, and operational boundaries for FinTax support.",
          href: "/legal/terms",
          cta: "Read terms",
        },
        {
          tag: "Start",
          title: "Secure account access",
          body: "Open your account to begin intake and continue into the authenticated workspace.",
          href: "/auth",
          cta: "Open secure access",
        },
      ],
    },
    finalCta: {
      eyebrow: "Start with clarity",
      title: "Open the guided flow and move your case forward with structure.",
      body:
        "Choose the relevant intake, confirm the case scope, and continue inside a workspace built for Dutch tax and benefits follow-through.",
      primaryCta: "Start secure intake",
      secondaryCta: "Go to account access",
    },
    footer: {
      legalTitle: "FinTax",
      legalBody:
        "Professional support for Dutch tax and benefits workflows, designed for international users who need a clearer process.",
      legalLinksTitle: "Legal",
      languagesTitle: "Languages",
      navigationTitle: "Navigation",
      privacy: "Privacy",
      terms: "Terms",
      taxReturn: "Tax return intake",
      benefits: "Benefits intake",
    },
  },
  es: {
    nav: {
      howItWorks: "Como funciona",
      services: "Servicios",
      pricing: "Precios",
      faq: "FAQ",
      resources: "Recursos",
    },
    actions: {
      signIn: "Acceso",
      getStarted: "Empezar intake seguro",
      seeFlow: "Ver el flujo guiado",
    },
    hero: {
      eyebrow: "Soporte estructurado para impuestos y subsidios en NL",
      title: "Un espacio premium para impuestos y subsidios en los Paises Bajos.",
      body:
        "FinTax ayuda a hogares internacionales a avanzar en procesos fiscales y de subsidios en NL con un intake guiado, revision humana y seguimiento claro del caso.",
      primaryCta: "Empezar intake fiscal",
      secondaryCta: "Ver como funciona FinTax",
      microcopy:
        "No prometemos devoluciones. El alcance y los siguientes pasos se aclaran antes de ejecutar el caso.",
      panelLabel: "Espacio del caso",
      panelTitle: "Un solo lugar para intake, revision y progreso del caso.",
      panelBody:
        "Sube documentos, responde a la checklist y sigue el estado de cada caso fiscal o de subsidios sin cambiar de canal.",
      panelPoints: [
        "Intake guiado para impuestos y subsidios",
        "Revision humana antes del soporte de presentacion",
        "Checklist y estados en el espacio del cliente",
      ],
      stats: [
        { label: "Cobertura", value: "Impuestos" },
        { label: "Cobertura", value: "Subsidios" },
        { label: "Proceso", value: "Revision humana" },
      ],
    },
    trustStrip: [
      "Soporte multilingue",
      "Intake guiado",
      "Revision humana",
      "Seguimiento de estado",
      "Rutas protegidas",
    ],
    howItWorks: {
      eyebrow: "Como funciona FinTax",
      title: "Tres pasos claros desde el intake hasta el seguimiento.",
      intro:
        "El proceso reduce ambiguedad para usuarios internacionales y mantiene cada caso ordenado y revisable.",
      steps: [
        {
          title: "Compartes informacion y documentos",
          body: "Empiezas con un intake seguro, explicas el contexto y subes los documentos que ya tienes.",
        },
        {
          title: "Revision y validacion",
          body: "Un especialista revisa el expediente, marca faltantes y confirma lo que puede avanzar.",
        },
        {
          title: "Seguimiento y ejecucion",
          body: "Sigues checklist, estado del caso y proximas acciones desde el espacio autenticado.",
        },
      ],
    },
    services: {
      eyebrow: "Servicios",
      title: "Disenado para flujos reales de impuestos y subsidios.",
      intro:
        "FinTax se centra en el trabajo operativo que necesitan los usuarios para impuestos en NL, subsidios y gestion guiada del caso.",
      items: [
        {
          title: "Declaraciones en NL",
          body: "Soporte guiado para rutas comunes de declaracion, recopilacion documental y avance del caso.",
          intent: "tax-return",
        },
        {
          title: "Ayuda con subsidios",
          body: "Soporte estructurado para contexto de elegibilidad, intake y seguimiento de casos de subsidios.",
          intent: "benefits",
        },
        {
          title: "Gestion del caso",
          body: "Un espacio de cliente para checklist, revision operativa y visibilidad clara de los siguientes pasos.",
          intent: "tax-return",
        },
        {
          title: "Soporte documental y de estado",
          body: "Mantiene archivos, solicitudes e hitos del caso ordenados en un solo lugar.",
          intent: "benefits",
        },
      ],
    },
    pricing: {
      eyebrow: "Precios",
      title: "Planes claros con alcance confirmado antes de empezar.",
      note:
        "Precios representativos para casos comunes. Los escenarios complejos pueden requerir una cotizacion por alcance.",
      featuredLabel: "Mas habitual",
      plans: [
        {
          name: "Return",
          price: "Desde EUR 149",
          summary: "Para declaraciones anuales sencillas con intake guiado.",
          features: ["Intake estructurado", "Checklist documental", "Seguimiento del caso"],
          cta: "Empezar declaracion",
          intent: "tax-return",
        },
        {
          name: "Return + Review",
          price: "Desde EUR 199",
          summary: "Para los casos mas comunes que necesitan revision antes del soporte de presentacion.",
          features: ["Revision humana", "Seguimiento de checklist", "Actualizaciones del espacio del caso"],
          cta: "Elegir revision guiada",
          intent: "tax-return",
          featured: true,
        },
        {
          name: "Benefits",
          price: "Desde EUR 39",
          summary: "Para intake, orientacion y soporte de gestion en casos de subsidios.",
          features: ["Intake de subsidios", "Captura de contexto", "Visibilidad del progreso"],
          cta: "Empezar subsidios",
          intent: "benefits",
        },
      ],
    },
    proof: {
      eyebrow: "Confianza operativa",
      title: "Pruebas basadas en proceso, no en claims de marketing.",
      items: [
        {
          title: "Acceso protegido",
          body: "Las rutas autenticadas y el acceso a cuenta estan separados de las paginas publicas.",
        },
        {
          title: "Revision humana",
          body: "Los casos pasan por revision especializada antes del soporte de presentacion.",
        },
        {
          title: "Seguimiento estructurado",
          body: "Checklist y cambios de estado permanecen visibles en el espacio del cliente.",
        },
        {
          title: "Enfoque concreto",
          body: "FinTax se posiciona en impuestos y subsidios de NL, sin claims financieros genericos.",
        },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Preguntas comunes antes de empezar.",
      items: [
        {
          question: "Puedo empezar si todavia no tengo todos los documentos?",
          answer: "Si. Puedes abrir el intake y subir el resto cuando la checklist lo pida.",
        },
        {
          question: "FinTax garantiza una devolucion o un resultado?",
          answer: "No. El resultado depende de los hechos del caso, de la documentacion y de la evaluacion de la autoridad neerlandesa.",
        },
        {
          question: "Puedo seguir el caso despues del intake?",
          answer: "Si. El espacio autenticado esta pensado para mostrar progreso, estado y siguientes acciones.",
        },
        {
          question: "El servicio es solo para declaraciones?",
          answer: "No. FinTax tambien cubre orientacion y gestion de casos relacionados con subsidios en NL.",
        },
      ],
    },
    resources: {
      eyebrow: "Recursos",
      title: "Paginas publicas que explican alcance y proceso.",
      intro:
        "FinTax mantiene los recursos publicos concisos y verificables. Si mas adelante se anade contenido editorial, debe seguir el mismo estandar.",
      items: [
        {
          tag: "Legal",
          title: "Aviso de privacidad",
          body: "Como se tratan los datos de cuenta, caso, pagos y documentos en el producto.",
          href: "/legal/privacy",
          cta: "Leer privacidad",
        },
        {
          tag: "Legal",
          title: "Terminos del servicio",
          body: "Alcance, pagos y limites operativos del soporte FinTax.",
          href: "/legal/terms",
          cta: "Leer terminos",
        },
        {
          tag: "Inicio",
          title: "Acceso seguro a tu cuenta",
          body: "Abre tu cuenta para empezar el intake y continuar en el espacio autenticado.",
          href: "/auth",
          cta: "Abrir acceso seguro",
        },
      ],
    },
    finalCta: {
      eyebrow: "Empieza con claridad",
      title: "Abre el flujo guiado y mueve tu caso con orden.",
      body:
        "Elige el intake adecuado, confirma el alcance y continua en un espacio pensado para impuestos y subsidios en NL.",
      primaryCta: "Empezar intake seguro",
      secondaryCta: "Ir a acceso de cuenta",
    },
    footer: {
      legalTitle: "FinTax",
      legalBody:
        "Soporte profesional para flujos de impuestos y subsidios en NL, pensado para usuarios internacionales que necesitan mas claridad.",
      legalLinksTitle: "Legal",
      languagesTitle: "Idiomas",
      navigationTitle: "Navegacion",
      privacy: "Privacidad",
      terms: "Terminos",
      taxReturn: "Intake fiscal",
      benefits: "Intake de subsidios",
    },
  },
  nl: {
    nav: {
      howItWorks: "Werkwijze",
      services: "Diensten",
      pricing: "Prijzen",
      faq: "FAQ",
      resources: "Publieke info",
    },
    actions: {
      signIn: "Inloggen",
      getStarted: "Start beveiligde intake",
      seeFlow: "Bekijk de begeleide flow",
    },
    hero: {
      eyebrow: "Gestructureerde hulp bij belasting en toeslagen in NL",
      title: "Een premium workspace voor belasting en toeslagen in Nederland.",
      body:
        "FinTax helpt internationale huishoudens door Nederlandse belasting- en toeslagenprocessen met een begeleide intake, menselijke review en duidelijke casusopvolging.",
      primaryCta: "Start belasting intake",
      secondaryCta: "Bekijk hoe FinTax werkt",
      microcopy: "Geen teruggaafgaranties. Scope en vervolgstappen worden eerst verduidelijkt.",
      panelLabel: "Case workspace",
      panelTitle: "Een plek voor intake, review en voortgang.",
      panelBody:
        "Upload documenten, reageer op checklist-verzoeken en volg de status van elke belasting- of toeslagencase zonder losse kanalen.",
      panelPoints: [
        "Begeleide intake voor belasting en toeslagen",
        "Menselijke review voor ondersteuning bij indiening",
        "Checklist en statussen in de client workspace",
      ],
      stats: [
        { label: "Dekking", value: "Belasting" },
        { label: "Dekking", value: "Toeslagen" },
        { label: "Proces", value: "Menselijke review" },
      ],
    },
    trustStrip: ["Meertalige ondersteuning", "Begeleide intake", "Menselijke review", "Status tracking", "Beschermde routes"],
    howItWorks: {
      eyebrow: "Hoe FinTax werkt",
      title: "Drie duidelijke stappen van intake tot opvolging.",
      intro:
        "Het proces is bedoeld om onduidelijkheid voor internationale gebruikers te verminderen en elke case controleerbaar te houden.",
      steps: [
        {
          title: "Deel informatie en documenten",
          body: "Start met beveiligde intake, geef context en upload de documenten die je al hebt.",
        },
        {
          title: "Review en validatie",
          body: "Een specialist beoordeelt het dossier, markeert ontbrekende onderdelen en bevestigt wat verder kan.",
        },
        {
          title: "Volg voortgang en uitvoering",
          body: "Bekijk checklist, status en volgende acties vanuit de beveiligde workspace.",
        },
      ],
    },
    services: {
      eyebrow: "Diensten",
      title: "Ontworpen rond echte belasting- en toeslagenflows.",
      intro:
        "FinTax blijft gericht op het operationele werk dat gebruikers nodig hebben voor Nederlandse belasting, toeslagen en begeleide case handling.",
      items: [
        {
          title: "Nederlandse belastingaangifte",
          body: "Begeleiding voor veelvoorkomende aangifteroutes, documentverzameling en case voortgang.",
          intent: "tax-return",
        },
        {
          title: "Toeslagen begeleiding",
          body: "Gestructureerde hulp bij context, intake en opvolging voor toeslagenzaken.",
          intent: "benefits",
        },
        {
          title: "Case handling",
          body: "Een client workspace voor checklistbeheer, operationele review en heldere vervolgstappen.",
          intent: "tax-return",
        },
        {
          title: "Document- en statushulp",
          body: "Bestanden, verzoeken en mijlpalen blijven gedurende het proces op een plek geordend.",
          intent: "benefits",
        },
      ],
    },
    pricing: {
      eyebrow: "Prijzen",
      title: "Duidelijke plannen met scopebevestiging vooraf.",
      note: "Representatieve prijzen voor veelvoorkomende cases. Complexere scenario's kunnen een gerichte offerte vragen.",
      featuredLabel: "Meest gekozen",
      plans: [
        {
          name: "Return",
          price: "Vanaf EUR 149",
          summary: "Voor eenvoudige jaarlijkse aangiftes met begeleide intake.",
          features: ["Gestructureerde intake", "Document checklist", "Case status tracking"],
          cta: "Start aangifte intake",
          intent: "tax-return",
        },
        {
          name: "Return + Review",
          price: "Vanaf EUR 199",
          summary: "Voor de meest voorkomende aangiftes met extra review voor ondersteuning bij indiening.",
          features: ["Menselijke review", "Checklist opvolging", "Workspace updates"],
          cta: "Kies begeleide review",
          intent: "tax-return",
          featured: true,
        },
        {
          name: "Benefits",
          price: "Vanaf EUR 39",
          summary: "Voor intake, begeleiding en case support rond toeslagen.",
          features: ["Toeslagen intake", "Context vastleggen", "Voortgang zichtbaar"],
          cta: "Start toeslagen intake",
          intent: "benefits",
        },
      ],
    },
    proof: {
      eyebrow: "Operationeel vertrouwen",
      title: "Onderbouwing via proces, niet via marketingclaims.",
      items: [
        { title: "Beschermde toegang", body: "Authentieke routes en accounttoegang zijn gescheiden van publieke pagina's." },
        { title: "Menselijke review", body: "Cases worden door een specialist beoordeeld voor ondersteuning bij indiening." },
        { title: "Gestructureerde opvolging", body: "Checklist-verzoeken en statuswijzigingen blijven zichtbaar in de client workspace." },
        { title: "Gerichte scope", body: "FinTax blijft duidelijk gepositioneerd rond Nederlandse belasting en toeslagen." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Veelgestelde vragen voor de start.",
      items: [
        { question: "Kan ik beginnen zonder alle documenten compleet?", answer: "Ja. Je kunt eerst intake starten en later extra bestanden uploaden wanneer de checklist daarom vraagt." },
        { question: "Garandeert FinTax een teruggaaf of uitkomst?", answer: "Nee. Uitkomsten hangen af van de feiten, documenten en de beoordeling door de relevante Nederlandse instantie." },
        { question: "Kan ik het proces na intake volgen?", answer: "Ja. De beveiligde workspace laat checklistvoortgang, status en volgende acties zien." },
        { question: "Is de dienst alleen voor belastingaangiftes?", answer: "Nee. FinTax ondersteunt ook begeleiding en case handling voor toeslagen." },
      ],
    },
    resources: {
      eyebrow: "Publieke info",
      title: "Openbare pagina's over scope en proces.",
      intro: "FinTax houdt publieke informatie compact en feitelijk. Later toegevoegde content moet aan dezelfde bewijsstandaard voldoen.",
      items: [
        { tag: "Legal", title: "Privacyverklaring", body: "Hoe account-, case-, betaal- en documentgegevens in het product worden verwerkt.", href: "/legal/privacy", cta: "Lees privacy" },
        { tag: "Legal", title: "Servicevoorwaarden", body: "Scope, betalingen en operationele grenzen van FinTax ondersteuning.", href: "/legal/terms", cta: "Lees voorwaarden" },
        { tag: "Start", title: "Beveiligde accounttoegang", body: "Open je account om intake te starten en verder te gaan in de beveiligde workspace.", href: "/auth", cta: "Open accounttoegang" },
      ],
    },
    finalCta: {
      eyebrow: "Start met duidelijkheid",
      title: "Open de begeleide flow en breng je case vooruit met structuur.",
      body: "Kies de juiste intake, bevestig de scope en werk verder in een workspace voor belasting en toeslagen in NL.",
      primaryCta: "Start beveiligde intake",
      secondaryCta: "Ga naar accounttoegang",
    },
    footer: {
      legalTitle: "FinTax",
      legalBody: "Professionele ondersteuning voor Nederlandse belasting- en toeslagenflows, ontworpen voor internationale gebruikers die een duidelijker proces nodig hebben.",
      legalLinksTitle: "Legal",
      languagesTitle: "Talen",
      navigationTitle: "Navigatie",
      privacy: "Privacy",
      terms: "Voorwaarden",
      taxReturn: "Belasting intake",
      benefits: "Toeslagen intake",
    },
  },
  pl: {
    nav: {
      howItWorks: "Jak to dziala",
      services: "Uslugi",
      pricing: "Cennik",
      faq: "FAQ",
      resources: "Zasoby",
    },
    actions: {
      signIn: "Logowanie",
      getStarted: "Start bezpieczny intake",
      seeFlow: "Zobacz proces",
    },
    hero: {
      eyebrow: "Uporzadkowane wsparcie podatkow i swiadczen w NL",
      title: "Premium workspace dla podatkow i swiadczen w Niderlandach.",
      body: "FinTax pomaga miedzynarodowym gospodarstwom przejsc przez holenderskie procesy podatkowe i swiadczenia dzieki jednemu intake, review specjalisty i jasnemu trackingowi sprawy.",
      primaryCta: "Start intake podatkowy",
      secondaryCta: "Zobacz jak dziala FinTax",
      microcopy: "Bez gwarancji zwrotu. Zakres i kolejne kroki sa wyjasniane przed realizacja sprawy.",
      panelLabel: "Workspace sprawy",
      panelTitle: "Jedno miejsce na intake, review i postep.",
      panelBody: "Przesylaj dokumenty, odpowiadaj na checklisty i sledz status sprawy podatkowej lub swiadczen bez zmiany kanalu.",
      panelPoints: ["Prowadzony intake dla podatkow i swiadczen", "Review specjalisty przed wsparciem przy zlozeniu", "Checklisty i statusy w panelu klienta"],
      stats: [
        { label: "Zakres", value: "Podatki" },
        { label: "Zakres", value: "Swiadczenia" },
        { label: "Proces", value: "Review czlowieka" },
      ],
    },
    trustStrip: ["Wsparcie wielojezyczne", "Prowadzony intake", "Review specjalisty", "Sledzenie statusu", "Chronione trasy"],
    howItWorks: {
      eyebrow: "Jak dziala FinTax",
      title: "Trzy jasne kroki od intake do dalszych dzialan.",
      intro: "Proces ma ograniczac niepewnosc u uzytkownikow miedzynarodowych i utrzymywac kazda sprawe w uporzadkowanym trybie.",
      steps: [
        { title: "Udostepniasz informacje i dokumenty", body: "Zaczynasz od bezpiecznego intake, opisujesz kontekst i przesylasz dostepne dokumenty." },
        { title: "Review i walidacja", body: "Specjalista sprawdza akta, wskazuje braki i potwierdza co moze isc dalej." },
        { title: "Sledzenie postepu i realizacji", body: "Obserwujesz checklisty, status i kolejne kroki w zalogowanym workspace." },
      ],
    },
    services: {
      eyebrow: "Uslugi",
      title: "Zbudowane wokol realnych workflow podatkowych i swiadczen.",
      intro: "FinTax skupia sie na operacyjnym wsparciu, ktore jest potrzebne przy holenderskich podatkach, swiadczeniach i prowadzeniu sprawy.",
      items: [
        { title: "Holenderskie rozliczenia podatkowe", body: "Prowadzenie przez typowe sciezki rozliczenia, kompletowanie dokumentow i postep sprawy.", intent: "tax-return" },
        { title: "Wsparcie swiadczen", body: "Uporzadkowana pomoc przy kwalifikacji, intake i dalszych krokach w sprawach swiadczen.", intent: "benefits" },
        { title: "Prowadzenie sprawy", body: "Workspace klienta dla checklist, review operacyjnego i jasnej widocznosci kolejnych krokow.", intent: "tax-return" },
        { title: "Dokumenty i status", body: "Pliki, prosby i kamienie milowe pozostaja uporzadkowane w jednym miejscu.", intent: "benefits" },
      ],
    },
    pricing: {
      eyebrow: "Cennik",
      title: "Jasne plany z potwierdzeniem zakresu przed startem.",
      note: "Orientacyjne ceny dla typowych spraw. Bardziej zlozone scenariusze moga wymagac indywidualnej wyceny.",
      featuredLabel: "Najczestszy wybor",
      plans: [
        { name: "Return", price: "Od EUR 149", summary: "Dla prostych rocznych rozliczen z prowadzonym intake.", features: ["Uporzadkowany intake", "Checklist dokumentow", "Sledzenie statusu"], cta: "Start rozliczenia", intent: "tax-return" },
        { name: "Return + Review", price: "Od EUR 199", summary: "Dla najczestszych spraw, ktore wymagaja glebszego review przed wsparciem przy zlozeniu.", features: ["Review specjalisty", "Obsluga checklisty", "Aktualizacje workspace"], cta: "Wybierz review", intent: "tax-return", featured: true },
        { name: "Benefits", price: "Od EUR 39", summary: "Dla intake, wskazowek i wsparcia prowadzenia sprawy swiadczen.", features: ["Intake swiadczen", "Zebranie kontekstu", "Widocznosc postepu"], cta: "Start swiadczen", intent: "benefits" },
      ],
    },
    proof: {
      eyebrow: "Zaufanie operacyjne",
      title: "Dowody oparte na procesie, nie na marketingu.",
      items: [
        { title: "Chroniony dostep", body: "Trasy zalogowane i dostep do konta sa oddzielone od stron publicznych." },
        { title: "Review specjalisty", body: "Sprawy przechodza przez review czlowieka przed wsparciem przy zlozeniu." },
        { title: "Uporzadkowane dalsze kroki", body: "Checklisty i zmiany statusu pozostaja widoczne w workspace klienta." },
        { title: "Skoncentrowany zakres", body: "FinTax pozostaje jasno osadzony w podatkach i swiadczeniach NL." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Najczestsze pytania przed startem.",
      items: [
        { question: "Czy moge zaczac bez wszystkich dokumentow?", answer: "Tak. Mozesz uruchomic intake i dolaczac kolejne pliki, gdy checklist o nie poprosi." },
        { question: "Czy FinTax gwarantuje zwrot albo wynik?", answer: "Nie. Wynik zalezy od faktow sprawy, dokumentow i oceny odpowiedniego holenderskiego urzedu." },
        { question: "Czy moge sledzic sprawe po intake?", answer: "Tak. Zalogowany workspace pokazuje postep checklisty, status i kolejne kroki." },
        { question: "Czy usluga dotyczy tylko rozliczen?", answer: "Nie. FinTax obejmuje takze wsparcie w zakresie swiadczen i prowadzenia sprawy." },
      ],
    },
    resources: {
      eyebrow: "Zasoby",
      title: "Publiczne strony wyjasniajace zakres i proces.",
      intro: "FinTax utrzymuje publiczne zasoby w formie krotkiej i rzeczowej. Pozniejsza tresc redakcyjna powinna trzymac ten sam standard wiarygodnosci.",
      items: [
        { tag: "Legal", title: "Polityka prywatnosci", body: "Jak produkt obsluguje dane konta, sprawy, platnosci i dokumentow.", href: "/legal/privacy", cta: "Czytaj prywatnosc" },
        { tag: "Legal", title: "Warunki uslugi", body: "Zakres, platnosci i granice operacyjne wsparcia FinTax.", href: "/legal/terms", cta: "Czytaj warunki" },
        { tag: "Start", title: "Bezpieczny dostep do konta", body: "Otworz konto, aby rozpoczac intake i przejsc do zalogowanego workspace.", href: "/auth", cta: "Otworz dostep" },
      ],
    },
    finalCta: {
      eyebrow: "Zacznij jasno",
      title: "Uruchom prowadzony flow i przesun sprawe do przodu.",
      body: "Wybierz odpowiedni intake, potwierdz zakres i kontynuuj w workspace zaprojektowanym pod podatki i swiadczenia w NL.",
      primaryCta: "Start bezpieczny intake",
      secondaryCta: "Przejdz do logowania",
    },
    footer: {
      legalTitle: "FinTax",
      legalBody: "Profesjonalne wsparcie dla holenderskich workflow podatkowych i swiadczen, przygotowane dla uzytkownikow miedzynarodowych potrzebujacych bardziej czytelnego procesu.",
      legalLinksTitle: "Informacje prawne",
      languagesTitle: "Jezyki",
      navigationTitle: "Nawigacja",
      privacy: "Prywatnosc",
      terms: "Warunki",
      taxReturn: "Intake podatkowy",
      benefits: "Intake swiadczen",
    },
  },
  ro: {
    nav: {
      howItWorks: "Cum functioneaza",
      services: "Servicii",
      pricing: "Preturi",
      faq: "FAQ",
      resources: "Resurse",
    },
    actions: {
      signIn: "Autentificare",
      getStarted: "Incepe intake securizat",
      seeFlow: "Vezi fluxul ghidat",
    },
    hero: {
      eyebrow: "Suport structurat pentru taxe si beneficii in NL",
      title: "Un workspace premium pentru taxe si beneficii in Olanda.",
      body: "FinTax ajuta gospodariile internationale sa parcurga procesele fiscale si de beneficii din NL printr-un intake ghidat, review uman si urmarire clara a cazului.",
      primaryCta: "Incepe intake fiscal",
      secondaryCta: "Vezi cum functioneaza FinTax",
      microcopy: "Fara garantii de rambursare. Scopul si pasii urmatori sunt clarificati inainte de executie.",
      panelLabel: "Workspace caz",
      panelTitle: "Un singur loc pentru intake, review si progres.",
      panelBody: "Incarci documente, raspunzi la checklist si urmaresti statusul fiecarui caz fiscal sau de beneficii fara canale separate.",
      panelPoints: ["Intake ghidat pentru taxe si beneficii", "Review uman inainte de suportul de depunere", "Checklist si status in workspace-ul clientului"],
      stats: [
        { label: "Acoperire", value: "Taxe" },
        { label: "Acoperire", value: "Beneficii" },
        { label: "Proces", value: "Review uman" },
      ],
    },
    trustStrip: ["Suport multilingv", "Intake ghidat", "Review uman", "Urmarire status", "Rute protejate"],
    howItWorks: {
      eyebrow: "Cum lucreaza FinTax",
      title: "Trei pasi clari de la intake la executie.",
      intro: "Procesul este gandit pentru a reduce ambiguitatea pentru utilizatorii internationali si pentru a pastra fiecare caz clar si verificabil.",
      steps: [
        { title: "Trimiti informatii si documente", body: "Pornesti cu intake securizat, explici contextul si incarci documentele pe care le ai deja." },
        { title: "Review si validare", body: "Un specialist verifica dosarul, marcheaza lipsurile si confirma ce poate continua." },
        { title: "Urmaresti progresul si executia", body: "Vezi checklist, statusul cazului si pasii urmatori din workspace-ul autentificat." },
      ],
    },
    services: {
      eyebrow: "Servicii",
      title: "Construit in jurul fluxurilor reale de taxe si beneficii.",
      intro: "FinTax ramane concentrat pe munca operationala de care utilizatorii au nevoie pentru taxe olandeze, beneficii si gestionare ghidata a cazului.",
      items: [
        { title: "Declaratii fiscale in NL", body: "Suport ghidat pentru rutele obisnuite de declarare, colectare documente si progresul cazului.", intent: "tax-return" },
        { title: "Ghidare pentru beneficii", body: "Suport structurat pentru context de eligibilitate, intake si urmarire pentru cazurile de beneficii.", intent: "benefits" },
        { title: "Gestionarea cazului", body: "Un workspace al clientului pentru checklist, review operational si vizibilitate clara asupra pasilor urmatori.", intent: "tax-return" },
        { title: "Suport documente si status", body: "Fisierele, solicitarile si etapele cazului raman ordonate intr-un singur loc.", intent: "benefits" },
      ],
    },
    pricing: {
      eyebrow: "Preturi",
      title: "Planuri clare, cu scop confirmat inainte de incepere.",
      note: "Preturi orientative pentru cazuri comune. Scenariile mai complexe pot necesita o oferta separata.",
      featuredLabel: "Cel mai comun",
      plans: [
        { name: "Return", price: "De la EUR 149", summary: "Pentru cazuri anuale simple cu intake ghidat.", features: ["Intake structurat", "Checklist documente", "Urmarire status"], cta: "Incepe declaratia", intent: "tax-return" },
        { name: "Return + Review", price: "De la EUR 199", summary: "Pentru cele mai comune cazuri ce au nevoie de review inainte de suport la depunere.", features: ["Review uman", "Urmarire checklist", "Actualizari workspace"], cta: "Alege review ghidat", intent: "tax-return", featured: true },
        { name: "Benefits", price: "De la EUR 39", summary: "Pentru intake, ghidare si suport de caz pentru beneficii.", features: ["Intake beneficii", "Captare context", "Vizibilitate progres"], cta: "Incepe beneficii", intent: "benefits" },
      ],
    },
    proof: {
      eyebrow: "Incredere operationala",
      title: "Dovezi bazate pe proces, nu pe promisiuni de marketing.",
      items: [
        { title: "Acces protejat", body: "Rutele autentificate si accesul la cont sunt separate de paginile publice." },
        { title: "Review uman", body: "Cazurile trec prin review de specialist inainte de suportul de depunere." },
        { title: "Urmarire structurata", body: "Checklistul si schimbarile de status raman vizibile in workspace-ul clientului." },
        { title: "Scop clar", body: "FinTax ramane pozitionat clar in jurul taxelor si beneficiilor din NL." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Intrebari frecvente inainte de start.",
      items: [
        { question: "Pot incepe inainte sa am toate documentele?", answer: "Da. Poti deschide intake-ul si adauga fisierele lipsa atunci cand checklistul le cere." },
        { question: "FinTax garanteaza o rambursare sau un rezultat?", answer: "Nu. Rezultatul depinde de faptele cazului, documentele oferite si evaluarea autoritatii relevante din Olanda." },
        { question: "Pot urmari cazul dupa intake?", answer: "Da. Workspace-ul autentificat este gandit pentru checklist, status si pasii urmatori." },
        { question: "Serviciul este doar pentru declaratii fiscale?", answer: "Nu. FinTax acopera si ghidare pentru beneficii si gestionare de caz pentru procese olandeze." },
      ],
    },
    resources: {
      eyebrow: "Resurse",
      title: "Pagini publice care explica scopul si procesul.",
      intro: "FinTax mentine resursele publice concise si oneste. Daca apar materiale editoriale mai tarziu, ele trebuie sa urmeze acelasi standard.",
      items: [
        { tag: "Legal", title: "Nota de confidentialitate", body: "Cum sunt gestionate datele de cont, caz, plati si documente in produs.", href: "/legal/privacy", cta: "Citeste confidentialitatea" },
        { tag: "Legal", title: "Termeni de serviciu", body: "Scop, plati si limite operationale pentru suportul FinTax.", href: "/legal/terms", cta: "Citeste termenii" },
        { tag: "Start", title: "Acces securizat la cont", body: "Deschide contul pentru a incepe intake-ul si a continua in workspace-ul autentificat.", href: "/auth", cta: "Deschide accesul" },
      ],
    },
    finalCta: {
      eyebrow: "Incepe clar",
      title: "Deschide fluxul ghidat si muta cazul inainte cu ordine.",
      body: "Alege intake-ul potrivit, confirma scopul si continua intr-un workspace construit pentru taxe si beneficii in NL.",
      primaryCta: "Incepe intake securizat",
      secondaryCta: "Mergi la acces cont",
    },
    footer: {
      legalTitle: "FinTax",
      legalBody: "Suport profesional pentru fluxuri de taxe si beneficii in Olanda, gandit pentru utilizatori internationali care au nevoie de mai multa claritate.",
      legalLinksTitle: "Legal",
      languagesTitle: "Limbi",
      navigationTitle: "Navigare",
      privacy: "Confidentialitate",
      terms: "Termeni",
      taxReturn: "Intake fiscal",
      benefits: "Intake beneficii",
    },
  },
};

export function getLandingContent(locale: string): LandingContent {
  return landingContent[(locale in landingContent ? locale : "en") as AppLocale];
}
