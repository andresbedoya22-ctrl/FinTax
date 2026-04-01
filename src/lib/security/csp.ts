function compactSourceList(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean)));
}

export function buildContentSecurityPolicy(appUrl?: string) {
  const appOrigin = appUrl?.trim() || null;
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

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
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
