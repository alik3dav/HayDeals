'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { normalizeCountryCode, normalizeRegion } from '@/features/deals/availability';
import { submitDealSchema } from '@/features/submit-deal/schemas';
import type { SubmitDealActionState } from '@/features/submit-deal/types';

function calculateDiscountPercent(originalPriceRaw: string | undefined, salePriceRaw: string | undefined) {
  const originalPrice = originalPriceRaw ? Number(originalPriceRaw) : null;
  const salePrice = salePriceRaw ? Number(salePriceRaw) : null;

  if (originalPrice === null || salePrice === null || Number.isNaN(originalPrice) || Number.isNaN(salePrice)) {
    return null;
  }

  if (originalPrice <= 0 || salePrice < 0 || salePrice >= originalPrice) {
    return null;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

function formDataToPayload(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    dealUrl: String(formData.get('dealUrl') ?? ''),
    couponCode: String(formData.get('couponCode') ?? ''),
    bundleText: String(formData.get('bundleText') ?? ''),
    originalPrice: String(formData.get('originalPrice') ?? ''),
    salePrice: String(formData.get('salePrice') ?? ''),
    discountPercent: String(formData.get('discountPercent') ?? ''),
    categoryId: String(formData.get('categoryId') ?? ''),
    storeId: String(formData.get('storeId') ?? ''),
    dealTypeId: String(formData.get('dealTypeId') ?? ''),
    dealTypeCode: String(formData.get('dealTypeCode') ?? ''),
    expiresAt: String(formData.get('expiresAt') ?? ''),
    imageUrl: String(formData.get('imageUrl') ?? ''),
    availabilityScope: String(formData.get('availabilityScope') ?? 'worldwide'),
    availabilityRegion: String(formData.get('availabilityRegion') ?? ''),
    availabilityCountryCode: String(formData.get('availabilityCountryCode') ?? ''),
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
  const availabilityRegion = payload.availabilityScope === 'region' ? normalizeRegion(payload.availabilityRegion) : null;
  const availabilityCountryCode = payload.availabilityScope === 'country' ? normalizeCountryCode(payload.availabilityCountryCode) : null;
  const supabase = await createClient();

  const { data: resolvedDealType, error: dealTypeError } = await supabase.from('deal_types').select('code').eq('id', payload.dealTypeId).maybeSingle();

  if (dealTypeError || !resolvedDealType?.code) {
    return {
      ok: false,
      message: 'Unable to resolve the selected deal type. Please re-select and try again.',
    };
  }

  const resolvedDealTypeCode = String(resolvedDealType.code);
  const autoCalculatedDiscount = resolvedDealTypeCode === 'price_drop' ? calculateDiscountPercent(payload.originalPrice, payload.salePrice) : null;

  if (resolvedDealTypeCode === 'price_drop' && autoCalculatedDiscount === null) {
    return {
      ok: false,
      message: 'Price Drop deals require valid original and current prices, where original is greater than current.',
      errors: {
        originalPrice: ['Original price is required and must be greater than current price.'],
        salePrice: ['Current price is required and must be lower than original price.'],
      },
    };
  }

  const { error } = await supabase.from('deals').insert({
    profile_id: user.id,
    category_id: payload.categoryId || null,
    store_id: payload.storeId || null,
    deal_type_id: payload.dealTypeId,
    title: payload.title,
    description: payload.description,
    deal_url: payload.dealUrl,
    coupon_code: payload.couponCode || null,
    bundle_text: payload.bundleText || null,
    original_price: payload.originalPrice ? Number(payload.originalPrice) : null,
    sale_price: payload.salePrice ? Number(payload.salePrice) : null,
    discount_percent: autoCalculatedDiscount ?? (payload.discountPercent ? Number(payload.discountPercent) : null),
    expires_at: payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null,
    image_url: payload.imageUrl || null,
    moderation_status: payload.intent === 'draft' ? 'draft' : 'pending',
    availability_scope: payload.availabilityScope,
    availability_region: availabilityRegion,
    availability_country_code: availabilityCountryCode,
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
