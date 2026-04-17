import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { detectCountryFromHeaders, getLocationCookieName } from '@/features/deals/location';
import { getOptionalPublicEnv } from '@/lib/env/public';

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isDashboardPath = path.startsWith('/dashboard');
  const isAdminPath = path.startsWith('/admin');
  const isAuthPath = path.startsWith('/sign-in') || path.startsWith('/sign-up');

  let response = NextResponse.next({ request });

  const detectedCountry = detectCountryFromHeaders(request.headers);
  const locationCookieName = getLocationCookieName();

  if (detectedCountry && request.cookies.get(locationCookieName)?.value !== detectedCountry) {
    response.cookies.set(locationCookieName, detectedCountry, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }

  if (!isDashboardPath && !isAdminPath && !isAuthPath) {
    return response;
  }

  const publicEnv = getOptionalPublicEnv();

  if (!publicEnv) {
    return response;
  }

  const supabase = createServerClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });

        if (detectedCountry && request.cookies.get(locationCookieName)?.value !== detectedCountry) {
          response.cookies.set(locationCookieName, detectedCountry, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
          });
        }

        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (isDashboardPath || isAdminPath)) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}
