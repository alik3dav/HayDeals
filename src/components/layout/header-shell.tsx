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
  let branding: { logotypeUrl: string | null; logoAlt: string | null; logoSize: 'small' | 'medium' | 'large' | 'custom' } = {
    logotypeUrl: null,
    logoAlt: null,
    logoSize: 'medium',
  };

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

  try {
    const { data } = await supabase
      .from('website_control_settings')
      .select('logotype_url, logo_alt, logo_size')
      .eq('id', 1)
      .maybeSingle();

    if (data) {
      branding = {
        logotypeUrl: data.logotype_url,
        logoAlt: data.logo_alt,
        logoSize: data.logo_size ?? 'medium',
      };
    }
  } catch (error) {
    console.error('Failed to load website branding for header.', error);
  }

  return (
    <HeaderNavClient
      canAccessAdmin={role === 'moderator' || role === 'admin'}
      categories={categories}
      isAuthenticated={Boolean(user)}
      onSignOut={signOutAction}
      profileAvatarUrl={profile?.avatarUrl}
      profileDisplayName={profile?.displayName}
      logoAlt={branding.logoAlt}
      logoSize={branding.logoSize}
      logotypeUrl={branding.logotypeUrl}
      userEmail={user?.email}
    />
  );
}
