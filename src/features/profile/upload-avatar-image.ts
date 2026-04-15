import { createOptionalClient } from '@/lib/supabase/browser';

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export type UploadAvatarResult =
  | { ok: true; publicUrl: string; path: string }
  | { ok: false; error: string };

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return 'Use JPG, PNG, WEBP, or AVIF files only.';
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return 'Avatar must be 2MB or smaller.';
  }

  return null;
}

export async function uploadAvatar(file: File, userId: string): Promise<UploadAvatarResult> {
  const validationError = validateAvatarFile(file);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const supabase = createOptionalClient();

  if (!supabase) {
    return { ok: false, error: 'Avatar uploads are temporarily unavailable. Please try again later.' };
  }

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    const message = uploadError.message.toLowerCase();

    if (message.includes('bucket') && message.includes('not found')) {
      return { ok: false, error: 'Avatar uploads are not configured yet. Please contact support.' };
    }

    if (message.includes('row-level security') || message.includes('policy')) {
      return { ok: false, error: 'You do not have permission to upload this avatar.' };
    }

    return { ok: false, error: 'Avatar upload failed. Please try again.' };
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  return {
    ok: true,
    publicUrl: data.publicUrl,
    path,
  };
}

export async function removeAvatar(path: string) {
  const supabase = createOptionalClient();

  if (!supabase || !path) {
    return;
  }

  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
}

export function extractAvatarPathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) {
    return '';
  }

  return url.slice(index + marker.length);
}
