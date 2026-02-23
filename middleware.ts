import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18n = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const intlResponse = handleI18n(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            intlResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const localeSegment = pathname.split("/")[1] ?? routing.defaultLocale;
  const locale = (routing.locales as readonly string[]).includes(localeSegment)
    ? localeSegment
    : routing.defaultLocale;

  const protectedSegments = ["/app", "/dashboard", "/tax-return", "/benefits", "/settings"];
  const isProtectedUserRoute = protectedSegments.some((segment) => pathname.includes(segment));

  if (isProtectedUserRoute && !user) {
    return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
  }

  if (pathname.includes("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
    }
  }

  const isAuthRoute = pathname.includes("/auth") && !pathname.includes("/auth/callback");
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
