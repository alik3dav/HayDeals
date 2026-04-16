import { createOptionalClient } from '@/lib/supabase/browser';

const SIDEBAR_AD_IMAGE_BUCKET = 'sidebar-ad-images';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export type UploadSidebarAdImageResult =
  | {
      ok: true;
      publicUrl: string;
      path: string;
    }
  | {
      ok: false;
      error: string;
    };

export function validateSidebarAdImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Use JPG, PNG, WEBP, or AVIF files only.';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 5MB or smaller.';
  }

  return null;
}

export async function uploadSidebarAdImage(file: File): Promise<UploadSidebarAdImageResult> {
  const validationError = validateSidebarAdImageFile(file);

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
      error: 'Ad image uploads are temporarily unavailable. Please try again later.',
    };
  }

  const { error: uploadError } = await supabase.storage.from(SIDEBAR_AD_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    const message = uploadError.message.toLowerCase();

    if (message.includes('bucket') && message.includes('not found')) {
      return {
        ok: false,
        error: 'Ad image upload is not configured yet. Please contact support.',
      };
    }

    if (message.includes('row-level security') || message.includes('policy')) {
      return {
        ok: false,
        error: 'You do not have permission to upload ad images.',
      };
    }

    return {
      ok: false,
      error: 'Ad image upload failed. Please try again.',
    };
  }

  const { data } = supabase.storage.from(SIDEBAR_AD_IMAGE_BUCKET).getPublicUrl(path);

  return {
    ok: true,
    publicUrl: data.publicUrl,
    path,
  };
}

export async function removeSidebarAdImage(path: string) {
  const supabase = createOptionalClient();

  if (!supabase || !path) {
    return;
  }

  await supabase.storage.from(SIDEBAR_AD_IMAGE_BUCKET).remove([path]);
}

export function extractSidebarAdPathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${SIDEBAR_AD_IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) {
    return '';
  }

  return url.slice(index + marker.length);
}
