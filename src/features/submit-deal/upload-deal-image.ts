import { createClient } from '@/lib/supabase/browser';

const DEAL_IMAGE_BUCKET = 'deal-images';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export type UploadDealImageResult =
  | {
      ok: true;
      publicUrl: string;
      path: string;
    }
  | {
      ok: false;
      error: string;
    };

export function validateDealImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Use JPG, PNG, WEBP, or AVIF files only.';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 5MB or smaller.';
  }

  return null;
}

export async function uploadDealImage(file: File): Promise<UploadDealImageResult> {
  const validationError = validateDealImageFile(file);

  if (validationError) {
    return {
      ok: false,
      error: validationError,
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `submissions/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const supabase = createClient();

  const { error: uploadError } = await supabase.storage.from(DEAL_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    return {
      ok: false,
      error: 'Image upload failed. Please try again.',
    };
  }

  const { data } = supabase.storage.from(DEAL_IMAGE_BUCKET).getPublicUrl(path);

  return {
    ok: true,
    publicUrl: data.publicUrl,
    path,
  };
}

export async function removeDealImage(path: string) {
  const supabase = createClient();
  await supabase.storage.from(DEAL_IMAGE_BUCKET).remove([path]);
}
