'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

import type { WebsiteControlState } from '@/features/admin/types';

export async function moderateDealAction(formData: FormData) {
  const { user } = await requireRole(['moderator', 'admin']);
  const supabase = await createClient();

  const dealId = String(formData.get('dealId') ?? '');
  const intent = String(formData.get('intent') ?? 'approve');

  const updatePayload: Record<string, unknown> = {
    moderated_by: user.id,
    moderated_at: new Date().toISOString(),
  };

  if (intent === 'approve') updatePayload.moderation_status = 'approved';
  if (intent === 'reject') updatePayload.moderation_status = 'rejected';
  if (intent === 'feature') updatePayload.is_featured = true;
  if (intent === 'unfeature') updatePayload.is_featured = false;

  const { error } = await supabase.from('deals').update(updatePayload).eq('id', dealId);
  if (error) throw error;

  revalidatePath('/admin');
  revalidatePath('/admin/deals');
}

export async function updateDealAction(formData: FormData) {
  const { user } = await requireRole(['moderator', 'admin']);
  const supabase = await createClient();

  const dealId = String(formData.get('dealId') ?? '');

  const { error } = await supabase
    .from('deals')
    .update({
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? '') || null,
      deal_url: String(formData.get('dealUrl') ?? ''),
      coupon_code: String(formData.get('couponCode') ?? '') || null,
      sale_price: String(formData.get('salePrice') ?? '') ? Number(formData.get('salePrice')) : null,
      original_price: String(formData.get('originalPrice') ?? '') ? Number(formData.get('originalPrice')) : null,
      expires_at: String(formData.get('expiresAt') ?? '') ? new Date(String(formData.get('expiresAt'))).toISOString() : null,
      category_id: String(formData.get('categoryId') ?? '') || null,
      store_id: String(formData.get('storeId') ?? '') || null,
      moderation_note: String(formData.get('moderationNote') ?? '') || null,
      moderation_status: String(formData.get('moderationStatus') ?? 'pending'),
      is_featured: String(formData.get('isFeatured') ?? '') === 'on',
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', dealId);

  if (error) throw error;

  revalidatePath('/admin/deals');
  revalidatePath(`/admin/deals/${dealId}/edit`);
}

export async function upsertCategoryAction(formData: FormData) {
  await requireRole(['moderator', 'admin']);
  const supabase = await createClient();

  const id = String(formData.get('id') ?? '');
  const payload = {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    is_active: String(formData.get('isActive') ?? '') === 'on',
  };

  const query = id ? supabase.from('categories').update(payload).eq('id', id) : supabase.from('categories').insert(payload);
  const { error } = await query;
  if (error) throw error;

  revalidatePath('/admin/categories');
}

export async function upsertStoreAction(formData: FormData) {
  await requireRole(['moderator', 'admin']);
  const supabase = await createClient();

  const id = String(formData.get('id') ?? '');
  const payload = {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    website_url: String(formData.get('websiteUrl') ?? '') || null,
    is_active: String(formData.get('isActive') ?? '') === 'on',
  };

  const query = id ? supabase.from('stores').update(payload).eq('id', id) : supabase.from('stores').insert(payload);
  const { error } = await query;
  if (error) throw error;

  revalidatePath('/admin/stores');
}

export async function updateUserRoleAction(formData: FormData) {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role: String(formData.get('role') ?? 'user') })
    .eq('id', String(formData.get('userId') ?? ''));

  if (error) throw error;

  revalidatePath('/admin/users');
}

export async function updateReportStatusAction(formData: FormData) {
  const { user } = await requireRole(['moderator', 'admin']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('deal_reports')
    .update({
      report_status: String(formData.get('status') ?? 'open'),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', String(formData.get('reportId') ?? ''));

  if (error) throw error;

  revalidatePath('/admin/reports');
}

export async function saveWebsiteControlAction(prevState: WebsiteControlState, formData: FormData): Promise<WebsiteControlState> {
  await requireRole(['admin']);
  const supabase = await createClient();

  void prevState;

  const logoSizeInput = String(formData.get('logoSize') ?? 'medium');
  const logoSize = ['small', 'medium', 'large', 'custom'].includes(logoSizeInput) ? logoSizeInput : 'medium';

  const payload = {
    id: 1,
    logotype_url: String(formData.get('logotypeUrl') ?? '').trim() || null,
    logo_alt: String(formData.get('logoAlt') ?? '').trim() || null,
    logo_size: logoSize,
    primary_color: String(formData.get('primaryColor') ?? '#22c55e'),
    accent_color: String(formData.get('accentColor') ?? '#0f172a'),
    site_announcement: String(formData.get('siteAnnouncement') ?? '').trim() || null,
  };

  const { error } = await supabase.from('website_control_settings').upsert(payload, { onConflict: 'id' });
  if (error) {
    return {
      ok: false,
      message: `Unable to save website settings: ${error.message}`,
    };
  }

  revalidatePath('/admin/website-control');

  return {
    ok: true,
    message: 'Changes saved successfully. Branding settings are now persisted in Supabase.',
  };
}

export async function saveSidebarAdControlAction(prevState: WebsiteControlState, formData: FormData): Promise<WebsiteControlState> {
  await requireRole(['admin']);
  const supabase = await createClient();

  void prevState;

  const payload = {
    id: 1,
    sidebar_ad_background_image_url: String(formData.get('sidebarAdBackgroundImageUrl') ?? '').trim() || null,
    sidebar_ad_title: String(formData.get('sidebarAdTitle') ?? '').trim() || null,
    sidebar_ad_description: String(formData.get('sidebarAdDescription') ?? '').trim() || null,
    sidebar_ad_button_text: String(formData.get('sidebarAdButtonText') ?? '').trim() || null,
    sidebar_ad_href: String(formData.get('sidebarAdHref') ?? '').trim() || null,
    sidebar_ad_image_only: String(formData.get('sidebarAdImageOnly') ?? '') === 'on',
  };

  const { error } = await supabase.from('website_control_settings').upsert(payload, { onConflict: 'id' });
  if (error) {
    return {
      ok: false,
      message: `Unable to save ad settings: ${error.message}`,
    };
  }

  revalidatePath('/admin/ad-control');
  revalidatePath('/');

  return {
    ok: true,
    message: 'Ad settings saved successfully.',
  };
}
