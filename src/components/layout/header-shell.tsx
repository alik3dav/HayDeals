import { signOutAction } from '@/app/(auth)/actions';
import { HeaderNavClient } from '@/components/layout/header-nav-client';
import { getFeedFacets } from '@/features/deals/queries';
import { getCurrentUserRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export async function HeaderShell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user ? await getCurrentUserRole(user.id) : null;

  let categories: { value: string; label: string }[] = [];

  try {
    const facets = await getFeedFacets();
    categories = facets.categories;
  } catch (error) {
    console.error('Failed to load categories for header.', error);
  }

  return (
    <HeaderNavClient
      canAccessAdmin={role === 'moderator' || role === 'admin'}
      categories={categories}
      isAuthenticated={Boolean(user)}
      onSignOut={signOutAction}
      userEmail={user?.email}
    />
  );
}
