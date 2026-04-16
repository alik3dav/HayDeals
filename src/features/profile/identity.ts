type ProfileIdentityRecord = {
  username?: string | null;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

export function buildProfileDisplayName(profile: ProfileIdentityRecord, fallback = 'User') {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();

  if (fullName) return fullName;
  if (profile.display_name?.trim()) return profile.display_name.trim();
  if (profile.username?.trim()) return profile.username.trim();

  return fallback;
}

export function normalizeUsername(username: string) {
  return username.trim().replace(/^@+/, '');
}

export function getPublicProfilePath(username: string | null | undefined) {
  if (!username) {
    return null;
  }

  const normalized = normalizeUsername(username);

  if (!normalized) {
    return null;
  }

  return `/users/${encodeURIComponent(normalized)}`;
}
