const BASE_SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
] as const;

function compactSourceList(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean)));
}

export function createCspNonce() {
  return btoa(crypto.randomUUID());
}

export function buildContentSecurityPolicy(input: {
  appUrl?: string;
  nonce: string;
  isDev?: boolean;
}) {
  const appOrigin = input.appUrl?.trim() || null;
  const connectSrc = compactSourceList([
    "'self'",
    appOrigin,
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://api.stripe.com",
    "https://js.stripe.com",
  ]);

  const imgSrc = compactSourceList([
    "'self'",
    "data:",
    "blob:",
    appOrigin,
    "https://*.supabase.co",
    "https://q.stripe.com",
  ]);

  const scriptSrc = compactSourceList([
    "'self'",
    `'nonce-${input.nonce}'`,
    "https://js.stripe.com",
    input.isDev ? "'unsafe-eval'" : null,
  ]);

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self' blob:",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

export function applySecurityHeaders(headers: Headers, input?: { csp?: string; nonce?: string }) {
  for (const header of BASE_SECURITY_HEADERS) {
    headers.set(header.key, header.value);
  }

  if (input?.csp) {
    headers.set("Content-Security-Policy", input.csp);
  }

  if (input?.nonce) {
    headers.set("x-nonce", input.nonce);
  }
}
