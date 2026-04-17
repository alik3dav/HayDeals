import { createClient } from '@/lib/supabase/server';

import type { AdminCategory, AdminDealEdit, AdminDealQueueItem, AdminReport, AdminStore, AdminUser } from '@/features/admin/types';

export async function getAdminCounts() {
  const supabase = await createClient();

  const [{ count: pendingDeals }, { count: openReports }, { count: usersCount }] = await Promise.all([
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    supabase.from('deal_reports').select('*', { count: 'exact', head: true }).eq('report_status', 'open'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  return {
    pendingDeals: pendingDeals ?? 0,
    openReports: openReports ?? 0,
    usersCount: usersCount ?? 0,
  };
}

export async function getDealsReviewQueue(): Promise<AdminDealQueueItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deals')
    .select(
      'id, title, moderation_status, is_featured, reports_count, created_at, coupon_code, sale_price, original_price, currency_code, profiles:profiles!deals_profile_id_fkey(display_name, username), stores:stores!deals_store_id_fkey(name), categories:categories!deals_category_id_fkey(name)',
    )
    .in('moderation_status', ['pending', 'approved', 'rejected'])
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  return (data ?? []) as AdminDealQueueItem[];
}

export async function getCategories(): Promise<AdminCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('id, name, slug, is_active, created_at').order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminCategory[];
}

export async function getStores(): Promise<AdminStore[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, slug, website_url, logo_url, is_active, created_at')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminStore[];
}

export async function getUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, role, is_verified, reputation, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

export async function getReports(): Promise<AdminReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deal_reports')
    .select('id, reason, details, report_status, created_at, deals:deals!deal_reports_deal_id_fkey(id, title), profiles:profiles!deal_reports_profile_id_fkey(display_name, username)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;
  return (data ?? []) as AdminReport[];
}

export async function getDealForEdit(dealId: string): Promise<AdminDealEdit | null> {
  const supabase = await createClient();

  const [
    { data: deal, error: dealError },
    { data: categories, error: categoriesError },
    { data: stores, error: storesError },
    { data: dealTypes, error: dealTypesError },
  ] = await Promise.all([
    supabase
      .from('deals')
      .select(
        'id, title, description, deal_url, coupon_code, moderation_note, sale_price, original_price, discount_percent, bundle_text, image_url, deal_type_id, expires_at, moderation_status, is_featured, category_id, store_id, availability_scope, availability_region, availability_country_code',
      )
      .eq('id', dealId)
      .maybeSingle(),
    supabase.from('categories').select('id, name').eq('is_active', true).order('name', { ascending: true }),
    supabase.from('stores').select('id, name').eq('is_active', true).order('name', { ascending: true }),
    supabase.from('deal_types').select('id, name, code').eq('is_active', true).order('name', { ascending: true }),
  ]);

  if (dealError) throw dealError;
  if (categoriesError) throw categoriesError;
  if (storesError) throw storesError;
  if (dealTypesError) throw dealTypesError;
  if (!deal) return null;

  return {
    ...(deal as Omit<AdminDealEdit, 'categoryOptions' | 'storeOptions' | 'dealTypeOptions'>),
    categoryOptions: categories ?? [],
    storeOptions: stores ?? [],
    dealTypeOptions: (dealTypes ?? []).map((dealType) => ({
      id: dealType.id,
      label: dealType.name,
      code: String(dealType.code),
    })),
  };
}
