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
  let profile: { displayName: string; avatarUrl: string | null } | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, first_name, last_name, username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
      profile = {
        displayName: fullName || data.display_name || data.username || user.email || 'User',
        avatarUrl: data.avatar_url,
      };
    }
  }

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
      profileAvatarUrl={profile?.avatarUrl}
      profileDisplayName={profile?.displayName}
      userEmail={user?.email}
    />
  );
}
