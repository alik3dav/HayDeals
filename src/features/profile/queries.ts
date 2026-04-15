import { createClient } from '@/lib/supabase/server';
import type { ProfileSettings, UserIdentity } from '@/features/profile/types';

function buildDisplayName(profile: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
}, email: string | null) {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();

  if (fullName) return fullName;
  if (profile.display_name?.trim()) return profile.display_name.trim();
  if (profile.username?.trim()) return profile.username.trim();
  if (email?.trim()) return email.trim();

  return 'User';
}

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
      .select('id, username, display_name, first_name, last_name, avatar_url')
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
    displayName: buildDisplayName(profile, profile.email),
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.avatar_url,
    email: profile.email,
  };
}
