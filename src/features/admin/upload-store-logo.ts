import { createOptionalClient } from '@/lib/supabase/browser';

const STORE_LOGOS_BUCKET = 'store-logos';
const MAX_STORE_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_STORE_LOGO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export type UploadStoreLogoResult =
  | {
      ok: true;
      publicUrl: string;
      path: string;
    }
  | {
      ok: false;
      error: string;
    };

export function validateStoreLogoFile(file: File): string | null {
  if (!ALLOWED_STORE_LOGO_TYPES.has(file.type)) {
    return 'Use JPG, PNG, WEBP, or AVIF files only.';
  }

  if (file.size > MAX_STORE_LOGO_SIZE_BYTES) {
    return 'Logo must be 2MB or smaller.';
  }

  return null;
}

export async function uploadStoreLogo(file: File): Promise<UploadStoreLogoResult> {
  const validationError = validateStoreLogoFile(file);

  if (validationError) {
    return {
      ok: false,
      error: validationError,
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `admin/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const supabase = createOptionalClient();

  if (!supabase) {
    return {
      ok: false,
      error: 'Store logo uploads are temporarily unavailable. Please try again later.',
    };
  }

  const { error: uploadError } = await supabase.storage.from(STORE_LOGOS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    const message = uploadError.message.toLowerCase();

    if (message.includes('bucket') && message.includes('not found')) {
      return {
        ok: false,
        error: 'Store logo upload is not configured yet. Please contact support.',
      };
    }

    if (message.includes('row-level security') || message.includes('policy')) {
      return {
        ok: false,
        error: 'You do not have permission to upload store logos.',
      };
    }

    return {
      ok: false,
      error: 'Store logo upload failed. Please try again.',
    };
  }

  const { data } = supabase.storage.from(STORE_LOGOS_BUCKET).getPublicUrl(path);

  return {
    ok: true,
    publicUrl: data.publicUrl,
    path,
  };
}

export async function removeStoreLogo(path: string) {
  const supabase = createOptionalClient();

  if (!supabase || !path) {
    return;
  }

  await supabase.storage.from(STORE_LOGOS_BUCKET).remove([path]);
}

export function extractStoreLogoPathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${STORE_LOGOS_BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) {
    return '';
  }

  return url.slice(index + marker.length);
}
