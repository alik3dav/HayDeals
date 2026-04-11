'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { submitDealSchema } from '@/features/submit-deal/schemas';
import type { SubmitDealActionState } from '@/features/submit-deal/types';

function formDataToPayload(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    dealUrl: String(formData.get('dealUrl') ?? ''),
    couponCode: String(formData.get('couponCode') ?? ''),
    originalPrice: String(formData.get('originalPrice') ?? ''),
    salePrice: String(formData.get('salePrice') ?? ''),
    categoryId: String(formData.get('categoryId') ?? ''),
    storeId: String(formData.get('storeId') ?? ''),
    dealTypeId: String(formData.get('dealTypeId') ?? ''),
    dealTypeCode: String(formData.get('dealTypeCode') ?? ''),
    expiresAt: String(formData.get('expiresAt') ?? ''),
    imageUrl: String(formData.get('imageUrl') ?? ''),
    intent: String(formData.get('intent') ?? 'submit'),
  };
}

export async function createDealAction(_: SubmitDealActionState, formData: FormData): Promise<SubmitDealActionState> {
  const user = await requireUser();
  const parsed = submitDealSchema.safeParse(formDataToPayload(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please fix the highlighted issues and try again.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const payload = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.from('deals').insert({
    profile_id: user.id,
    category_id: payload.categoryId,
    store_id: payload.storeId,
    deal_type_id: payload.dealTypeId,
    title: payload.title,
    description: payload.description,
    deal_url: payload.dealUrl,
    coupon_code: payload.couponCode || null,
    original_price: payload.originalPrice ? Number(payload.originalPrice) : null,
    sale_price: payload.salePrice ? Number(payload.salePrice) : null,
    expires_at: payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null,
    image_url: payload.imageUrl || null,
    moderation_status: payload.intent === 'draft' ? 'draft' : 'pending',
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/', 'page');

  return {
    ok: true,
    message: payload.intent === 'draft' ? 'Draft saved successfully.' : 'Deal submitted for moderator review.',
  };
}
