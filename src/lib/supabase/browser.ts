import { createBrowserClient } from '@supabase/ssr';

import { getPublicEnv } from '@/lib/env/public';

export function createClient() {
  const publicEnv = getPublicEnv();

  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
