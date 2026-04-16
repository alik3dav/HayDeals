import { createClient } from '@/lib/supabase/server';
import { buildProfileDisplayName } from '@/features/profile/identity';
import type { ProfileSettings, UserIdentity } from '@/features/profile/types';

export async function getProfileSettings(profileId: string): Promise<ProfileSettings | null> {
  const supabase = await createClient();

  const [
    {
      data: { user },
      error: userError,
    },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('profiles')
      .select('id, username, display_name, first_name, last_name, avatar_url, points_total')
      .eq('id', profileId)
      .maybeSingle(),
  ]);

  if (userError) {
    throw userError;
  }

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    email: user?.email ?? null,
  };
}

export async function getUserIdentity(profileId: string): Promise<UserIdentity | null> {
  const profile = await getProfileSettings(profileId);

  if (!profile) {
    return null;
  }

  return {
    displayName: buildProfileDisplayName(profile, profile.email?.trim() || 'User'),
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.avatar_url,
    email: profile.email,
    pointsTotal: profile.points_total,
  };
}
