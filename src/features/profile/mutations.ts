'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { updateProfileSchema } from '@/features/profile/schemas';
import type { UpdateProfileState } from '@/features/profile/types';

function buildDisplayName(firstName: string, lastName: string, fallback: string | null) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName || fallback || null;
}

export async function updateProfileAction(_: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
  const user = await requireUser();

  const parsed = updateProfileSchema.safeParse({
    firstName: String(formData.get('firstName') ?? ''),
    lastName: String(formData.get('lastName') ?? ''),
    avatarUrl: String(formData.get('avatarUrl') ?? ''),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please fix the highlighted fields and try again.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const payload = parsed.data;
  const firstName = payload.firstName?.trim() || null;
  const lastName = payload.lastName?.trim() || null;
  const avatarUrl = payload.avatarUrl?.trim() || null;

  const supabase = await createClient();

  const { data: currentProfile, error: profileReadError } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single();

  if (profileReadError) {
    return {
      ok: false,
      message: 'Unable to load your profile right now. Please try again.',
    };
  }

  const fallbackName = currentProfile.username || currentProfile.display_name || user.email || null;
  const nextDisplayName = buildDisplayName(firstName ?? '', lastName ?? '', fallbackName);

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
      display_name: nextDisplayName,
    })
    .eq('id', user.id);

  if (error) {
    return {
      ok: false,
      message: 'Unable to save profile changes. Please try again.',
    };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/dashboard', 'layout');

  return {
    ok: true,
    message: 'Profile updated successfully.',
  };
}
