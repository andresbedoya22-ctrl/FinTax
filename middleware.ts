import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18n = createIntlMiddleware(routing);
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const WEBHOOK_PATHS = new Set(["/api/stripe/webhook"]);

type AALLevel = "aal1" | "aal2" | null;

function normalizeOrigin(origin: string | null): string | null {
  if (!origin) return null;
  try {
    return new URL(origin).origin.toLowerCase();
  } catch {
    return null;
  }
}

function collectAllowedOrigins(request: NextRequest): Set<string> {
  const allowlist = new Set<string>();
  const explicit = process.env.ALLOWED_ORIGINS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  explicit?.forEach((origin) => {
    const normalized = normalizeOrigin(origin);
    if (normalized) allowlist.add(normalized);
  });

  const appUrl = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? null);
  if (appUrl) allowlist.add(appUrl);

  const requestOrigin = normalizeOrigin(request.nextUrl.origin);
  if (requestOrigin) allowlist.add(requestOrigin);

  if (process.env.NODE_ENV !== "production") {
    allowlist.add("http://localhost:3000");
    allowlist.add("http://127.0.0.1:3000");
  }

  return allowlist;
}

function extractRequestOrigin(request: NextRequest): string | null {
  const directOrigin = normalizeOrigin(request.headers.get("origin"));
  if (directOrigin) return directOrigin;

  const referer = request.headers.get("referer");
  if (!referer) return null;

  try {
    return new URL(referer).origin.toLowerCase();
  } catch {
    return null;
  }
}

function getLocaleForPath(pathname: string): string {
  const localeSegment = pathname.split("/")[1] ?? routing.defaultLocale;
  return (routing.locales as readonly string[]).includes(localeSegment)
    ? localeSegment
    : routing.defaultLocale;
}

function isProtectedUserRoute(pathname: string): boolean {
  const protectedSegments = ["/app", "/dashboard", "/tax-return", "/benefits", "/settings"];
  return protectedSegments.some((segment) => pathname.includes(segment));
}

function withForwardedIp(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  const forwarded = request.headers.get("x-forwarded-for");
  const firstHop = forwarded?.split(",")[0]?.trim();

  if (firstHop) {
    headers.set("x-client-ip", firstHop);
  }

  return headers;
}

async function handleApiOriginPolicy(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) return null;
  if (!WRITE_METHODS.has(request.method)) return null;
  if (WEBHOOK_PATHS.has(pathname)) return null;

  const requestOrigin = extractRequestOrigin(request);
  const allowedOrigins = collectAllowedOrigins(request);

  if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  return NextResponse.next({
    request: {
      headers: withForwardedIp(request),
    },
  });
}

async function hasAdminRole(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return Boolean(data);
}

async function getAssuranceLevel(supabase: ReturnType<typeof createServerClient>): Promise<AALLevel> {
  const mfaApi = (supabase.auth as { mfa?: { getAuthenticatorAssuranceLevel?: () => Promise<{ data?: { currentLevel?: string | null } }> } }).mfa;
  if (!mfaApi?.getAuthenticatorAssuranceLevel) return null;

  try {
    const { data } = await mfaApi.getAuthenticatorAssuranceLevel();
    if (data?.currentLevel === "aal2") return "aal2";
    if (data?.currentLevel === "aal1") return "aal1";
    return null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const apiResponse = await handleApiOriginPolicy(request);
  if (apiResponse) return apiResponse;

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/")) {
    return NextResponse.next({
      request: {
        headers: withForwardedIp(request),
      },
    });
  }

  const intlResponse = handleI18n(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            intlResponse.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: true,
            });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const locale = getLocaleForPath(pathname);

  if (isProtectedUserRoute(pathname) && !user) {
    return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
  }

  if (pathname.includes("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
    }

    const [isAdmin, assuranceLevel] = await Promise.all([
      hasAdminRole(supabase, user.id),
      getAssuranceLevel(supabase),
    ]);

    if (!isAdmin) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    if (assuranceLevel !== "aal2") {
      const authUrl = new URL(`/${locale}/auth`, request.url);
      authUrl.searchParams.set("next", `/${locale}/admin`);
      authUrl.searchParams.set("reason", "mfa_required");
      return NextResponse.redirect(authUrl);
    }
  }

  const isAuthRoute = pathname.includes("/auth") && !pathname.includes("/auth/callback");
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!trpc|_next|_vercel|.*\\..*).*)"],
};
