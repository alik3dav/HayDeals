import { signOutAction } from '@/app/(auth)/actions';
import { HeaderNavClient } from '@/components/layout/header-nav-client';
import { getFeedFacets } from '@/features/deals/queries';
import { createClient } from '@/lib/supabase/server';

export async function HeaderShell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let categories: { value: string; label: string }[] = [];

  try {
    const facets = await getFeedFacets();
    categories = facets.categories;
  } catch (error) {
    console.error('Failed to load categories for header.', error);
  }

  return <HeaderNavClient categories={categories} isAuthenticated={Boolean(user)} onSignOut={signOutAction} userEmail={user?.email} />;
}
