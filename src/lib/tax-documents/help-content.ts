export interface RequirementHelpStep {
  label: string;
  detail: string;
}

export interface RequirementHelpContentTemplate {
  title: string;
  why: string;
  acceptedFiles: string[];
  minimumContent: string[];
  howToGet: RequirementHelpStep[];
  whenUnavailable: string;
  notes?: string[];
}

type HelpContext = {
  taxYear: number;
  originCountryCode: string;
  employerName?: string;
};

function textForCountry(code: string) {
  return code.toUpperCase();
}

export function getRequirementHelpContent(code: string, context: HelpContext): RequirementHelpContentTemplate {
  const originCountry = textForCountry(context.originCountryCode);

  const help: Record<string, RequirementHelpContentTemplate> = {
    passport_or_id_document: {
      title: "Passport or EU identity document",
      why: "FinTax needs a clear proof of identity to prepare and review your tax return safely.",
      acceptedFiles: ["PDF", "JPG", "PNG"],
      minimumContent: ["Full name", "Document number", "Valid issue and expiry dates", "Readable front side"],
      howToGet: [
        { label: "Scan or photograph the document", detail: "Use even lighting and include the full page without cropped corners." },
        { label: "Check validity", detail: "If the document expired during the process, upload the latest valid version you have." },
      ],
      whenUnavailable: "If you cannot upload it today, mark the requirement as not yet available and explain when you expect to provide it.",
    },
    proof_of_nl_registration_periods: {
      title: "Proof of Dutch registration periods",
      why: "A BRP extract or deregistration evidence is needed when residence in the Netherlands was not continuous for the full tax year.",
      acceptedFiles: ["PDF", "JPG", "PNG"],
      minimumContent: ["Registered municipality or authority", `Dates covering the period in ${context.taxYear}`, "Your name and address or BSN reference"],
      howToGet: [
        { label: "Request a BRP extract", detail: "Ask your gemeente for a BRP extract showing registration history or address history." },
        { label: "Add deregistration evidence if relevant", detail: "If you emigrated or deregistered, include the confirmation from the municipality." },
      ],
      whenUnavailable: "Upload the best official proof you already have and add a note explaining what final evidence is still pending.",
    },
    reestablishment_date_in_nl: {
      title: "Date of (re)establishment in the Netherlands",
      why: "The exact date is needed to determine the correct Dutch residency period for the selected tax year.",
      acceptedFiles: ["Portal answer"],
      minimumContent: ["Exact date in YYYY-MM-DD format"],
      howToGet: [
        { label: "Check your BRP registration history", detail: "Use the date shown in the municipality registration record." },
        { label: "If you returned to NL", detail: "Use the first day you were registered again after the interruption." },
      ],
      whenUnavailable: "Enter the best verified date you have and leave a note explaining what official source you are still waiting for.",
    },
    children_same_address_registration_date: {
      title: "Date children were registered at the same address",
      why: "This date helps determine household-related tax positions and whether supporting proof may be needed.",
      acceptedFiles: ["Portal answer", "BRP extract if requested later"],
      minimumContent: ["Date the child or children were registered at the same address"],
      howToGet: [
        { label: "Check municipality records", detail: "Use the registration date in the BRP or family address extract." },
        { label: "Use the first relevant shared registration date", detail: "If several children moved at different times, start with the earliest relevant date and explain any differences in a note." },
      ],
      whenUnavailable: "Mark it as not yet available and note whether you are waiting for a BRP extract or another official family registration record.",
    },
    emigration_or_deregistration_date: {
      title: "Date of emigration or deregistration",
      why: "The departure or deregistration date defines the Dutch tax period and affects origin-country income evidence.",
      acceptedFiles: ["Portal answer", "Deregistration confirmation if requested later"],
      minimumContent: ["Exact date in YYYY-MM-DD format", "Whether it was emigration or deregistration"],
      howToGet: [
        { label: "Check your deregistration confirmation", detail: "Use the official confirmation from the municipality if you have it." },
        { label: "Confirm against your BRP history", detail: "If the confirmation is missing, use the date shown in the registration history." },
      ],
      whenUnavailable: "Provide the best confirmed date you know and explain which official confirmation is still pending.",
    },
    origin_country_income_certificate: {
      title: `Income certificate from ${originCountry}`,
      why: `Because you were not registered in the Netherlands for the full tax year ${context.taxYear}, FinTax may need the income certificate or equivalent tax evidence from ${originCountry}.`,
      acceptedFiles: ["PDF", "Official tax authority scan"],
      minimumContent: ["Tax year covered", "Income earned outside the Netherlands", "Your name or fiscal identifier", "Issued by the competent authority or official portal"],
      howToGet: [
        { label: "Request it from the tax authority", detail: `Ask the tax authority or official tax portal in ${originCountry} for the annual income certificate or equivalent statement for ${context.taxYear}.` },
        { label: "Check that the full tax year is covered", detail: "If the country issues monthly or employer-specific proofs only, upload the full set and add a note." },
      ],
      whenUnavailable: "If the authority has not issued the certificate yet, upload the closest official proof available and explain what final document is outstanding.",
      notes: ["Do not upload an informal self-made summary unless FinTax explicitly asked for it as supplementary context."],
    },
    voorlopige_aanslag: {
      title: "Voorlopige aanslag",
      why: "A provisional assessment can affect prepayments, balances due, and the final reconciliation in the return.",
      acceptedFiles: ["PDF", "Screenshot exported as PDF"],
      minimumContent: ["Assessment year", "Reference or assessment number", "Amount paid or payable", "Taxpayer name"],
      howToGet: [
        { label: "Download from Mijn Belastingdienst", detail: "Use the official provisional assessment notice or annual overview." },
        { label: "Include the latest version", detail: "If you received more than one provisional assessment, upload the latest notice and mention earlier ones in a note." },
      ],
      whenUnavailable: "If you know a provisional assessment exists but cannot download it yet, mark it as not yet available and add the expected retrieval date.",
    },
    jaaropgaaf_employer: {
      title: `Jaaropgave employer${context.employerName ? `: ${context.employerName}` : ""}`,
      why: "Each employer must be supported separately so wage tax and employment periods can be matched correctly.",
      acceptedFiles: ["PDF", "Official payroll annual statement"],
      minimumContent: ["Employer name", `Annual wages for ${context.taxYear}`, "Payroll tax withheld", "Employee identification"],
      howToGet: [
        { label: "Download from payroll or HR portal", detail: "Most Dutch employers publish the jaaropgave in January or early February of the following year." },
        { label: "Request it from HR if missing", detail: "Ask payroll or HR for the annual statement covering the selected tax year." },
      ],
      whenUnavailable: "If a werkgever has not delivered the jaaropgave yet, upload payslips only as a temporary fallback and explain the expected delivery date.",
    },
    uwv_statement: {
      title: "UWV jaaropgave or annual benefit statement",
      why: "UWV income must be reported separately from salary income and needs its own official annual statement.",
      acceptedFiles: ["PDF"],
      minimumContent: ["UWV as issuing body", `Benefit amounts for ${context.taxYear}`, "Tax withheld if shown"],
      howToGet: [
        { label: "Download from UWV", detail: "Use the UWV portal or correspondence that provides the annual statement." },
        { label: "Check the full period", detail: "If the benefit started or ended mid-year, ensure the statement still covers the relevant period in the selected tax year." },
      ],
      whenUnavailable: "If the annual statement is missing, upload official monthly benefit statements temporarily and note that the year statement is pending.",
    },
    transitievergoeding_statement: {
      title: "Transitievergoeding statement",
      why: "A transition compensation payment may have separate tax treatment and must be substantiated.",
      acceptedFiles: ["PDF"],
      minimumContent: ["Paying employer", "Gross amount", "Tax withheld", "Payment date"],
      howToGet: [
        { label: "Check the termination settlement", detail: "Use the final settlement statement or payroll document that shows the transition payment." },
        { label: "Ask HR if needed", detail: "Request the official payment statement if it was not included with your exit paperwork." },
      ],
      whenUnavailable: "Upload the termination letter or final payslip if that is all you have for now, and note what formal statement is still missing.",
    },
    zzp_profit_documents: {
      title: "ZZP annual accounts and KVK-linked records",
      why: "Self-employment income requires a year-level profit basis instead of a single checkbox.",
      acceptedFiles: ["PDF", "XLSX", "CSV"],
      minimumContent: ["Annual revenue and costs", `Result for ${context.taxYear}`, "Business identity or KVK reference if available"],
      howToGet: [
        { label: "Export bookkeeping totals", detail: "Use your accounting software annual profit and loss statement or a bookkeeping export for the selected tax year." },
        { label: "Add KVK context where relevant", detail: "If you trade via a registered business, include the annual account or bookkeeping summary tied to that business." },
      ],
      whenUnavailable: "If year-end figures are still being closed, upload the latest bookkeeping export and explain what final annual account is pending.",
    },
    zzp_1225_hours_support: {
      title: "Support for 1225-hour criterion",
      why: "The ondernemersaftrek and related ZZP benefits can depend on substantiating at least 1225 business hours.",
      acceptedFiles: ["PDF", "XLSX", "CSV"],
      minimumContent: ["Hours log or planning", "Work descriptions or project references", `Coverage across ${context.taxYear}`],
      howToGet: [
        { label: "Export your time records", detail: "Use your hours tracking system, agenda, invoices, project planning, or another contemporaneous overview." },
        { label: "Make the annual coverage clear", detail: "The evidence should show that the total business effort spans the relevant tax year and is not only a final total number." },
      ],
      whenUnavailable: "If your time log is not consolidated yet, upload the best existing schedule or project export and note when the full annual hours support will be ready.",
    },
    mortgage_jaaroverzicht: {
      title: "Mortgage jaaroverzicht",
      why: "Mortgage interest and loan balance must come from the lender's annual overview.",
      acceptedFiles: ["PDF"],
      minimumContent: ["Lender name", `Annual interest paid for ${context.taxYear}`, "Outstanding balance", "Borrower name"],
      howToGet: [
        { label: "Download from your lender portal", detail: "Most banks publish the annual mortgage statement early in the year." },
        { label: "Use the complete annual overview", detail: "Do not upload only monthly debits unless FinTax asked for them additionally." },
      ],
      whenUnavailable: "If the yearly overview is delayed, upload the latest official mortgage summary and note that the jaaroverzicht is still pending.",
    },
    svn_starterslening_jaaroverzicht: {
      title: "SVN or starterslening jaaroverzicht",
      why: "SVN or starterslening balances and interest can affect deductible housing positions separately from the main mortgage.",
      acceptedFiles: ["PDF"],
      minimumContent: ["SVN or lender name", `Annual overview for ${context.taxYear}`, "Interest and loan balance"],
      howToGet: [
        { label: "Download from SVN or the loan provider", detail: "Use the annual statement issued for the selected tax year." },
        { label: "Include the official loan overview", detail: "If the loan was transferred, upload the overview from the provider that serviced it during the year." },
      ],
      whenUnavailable: "Upload the latest official payment or balance statement only as a temporary fallback and note what annual overview is missing.",
    },
    consumer_loan_statements: {
      title: "Consumer loan annual statements",
      why: "Relevant private debts must be supported with lender-issued annual balances or statements.",
      acceptedFiles: ["PDF"],
      minimumContent: ["Lender name", "Outstanding balance", `Position during ${context.taxYear}`],
      howToGet: [
        { label: "Request annual balances from lenders", detail: "Use annual account statements or year-end overviews from each lender." },
        { label: "Group by loan provider", detail: "If you have multiple consumer loans, make sure each lender is represented clearly." },
      ],
      whenUnavailable: "If a lender has not issued the annual statement yet, upload the latest official balance statement and note that the year-end overview is pending.",
    },
    nl_bank_and_savings_statements_summary: {
      title: "Dutch bank and savings annual overviews",
      why: "Bank and savings positions are needed to support the Dutch asset position for box 3.",
      acceptedFiles: ["PDF"],
      minimumContent: ["Bank name", `Year-end or annual balance for ${context.taxYear}`, "Account holder name"],
      howToGet: [
        { label: "Download annual overviews", detail: "Use the bank's annual statement or year-end balance overview for each relevant account." },
        { label: "Include savings accounts too", detail: "Do not limit the upload to current accounts if savings or deposit accounts also existed." },
      ],
      whenUnavailable: "Upload the 31 December account balance screenshot only as an interim fallback and explain which official annual overview is missing.",
    },
    foreign_bank_and_savings_statements_summary: {
      title: "Foreign bank and savings annual overviews",
      why: "Foreign accounts must be documented separately because they are outside Dutch banking data feeds.",
      acceptedFiles: ["PDF", "Official bank statement export"],
      minimumContent: ["Bank name", `Year-end or annual balance for ${context.taxYear}`, "Account holder name", "Country of the account"],
      howToGet: [
        { label: "Download annual overviews from each bank", detail: "Use official statements or annual summaries from the foreign bank portal." },
        { label: "Keep account country visible", detail: "If the account statement does not show the country clearly, add a short note explaining the institution and jurisdiction." },
      ],
      whenUnavailable: "Upload official monthly statements around 31 December only as a temporary fallback and note what annual summary is pending.",
    },
    crypto_value_proof_open_close_year: {
      title: "Crypto value proof at 01/01 and 31/12",
      why: `Crypto holdings must be documented at both 01/01/${context.taxYear} and 31/12/${context.taxYear}.`,
      acceptedFiles: ["PDF", "CSV export", "Exchange statement"],
      minimumContent: [`Value at 01/01/${context.taxYear}`, `Value at 31/12/${context.taxYear}`, "Wallet or exchange identification", "Currency used in the valuation"],
      howToGet: [
        { label: "Export exchange statements", detail: "Use official year-end holdings statements or transaction/value exports from your exchange or wallet provider." },
        { label: "Cover both dates", detail: "If one document does not show both dates, upload separate proofs for opening and closing positions." },
      ],
      whenUnavailable: "If the exchange cannot generate a year-end report immediately, upload the closest official exports you have and note what exact opening or closing proof is still pending.",
    },
    medical_costs_proof_unreimbursed: {
      title: "Proof of unreimbursed deductible medical costs",
      why: "Only medical expenses that were not reimbursed and are relevant for deduction should be included.",
      acceptedFiles: ["PDF", "JPG", "PNG"],
      minimumContent: ["Provider or pharmacy", "Amount paid", "Payment date", "Evidence that the cost was not reimbursed if available"],
      howToGet: [
        { label: "Collect invoices and payment proofs", detail: "Use invoices, receipts, and insurer overviews showing what was and was not reimbursed." },
        { label: "Prepare a focused set", detail: "Only include costs that are potentially deductible and relate to the selected tax year." },
      ],
      whenUnavailable: "If reimbursement evidence is still pending, upload the invoices you already have and note which insurer overview is still missing.",
    },
  };

  return help[code] ?? {
    title: "Supporting evidence",
    why: "FinTax needs structured evidence for this requirement.",
    acceptedFiles: ["PDF", "JPG", "PNG"],
    minimumContent: ["A readable official document or a complete answer in the portal"],
    howToGet: [{ label: "Use an official source", detail: "Upload a document or answer that clearly supports the requested fact." }],
    whenUnavailable: "Mark it as not yet available and explain what you still need to obtain.",
  };
}
