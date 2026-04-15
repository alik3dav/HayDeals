import { createBrowserClient } from '@supabase/ssr';

import { getOptionalPublicEnv, getPublicEnv } from '@/lib/env/public';

export function createOptionalClient() {
  const publicEnv = getOptionalPublicEnv();

  if (!publicEnv) {
    return null;
  }

  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function createClient() {
  const publicEnv = getPublicEnv();

  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
