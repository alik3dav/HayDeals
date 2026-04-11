import { createClient } from '@/lib/supabase/server';

import type { SubmitDealMeta } from '@/features/submit-deal/types';

export async function getSubmitDealMeta(): Promise<SubmitDealMeta> {
  const supabase = await createClient();

  const [{ data: categories, error: categoriesError }, { data: stores, error: storesError }, { data: dealTypes, error: dealTypesError }] =
    await Promise.all([
      supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name', { ascending: true }),
      supabase.from('stores').select('id, name, slug').eq('is_active', true).order('name', { ascending: true }),
      supabase.from('deal_types').select('id, name, code').eq('is_active', true).order('name', { ascending: true }),
    ]);

  if (categoriesError) throw categoriesError;
  if (storesError) throw storesError;
  if (dealTypesError) throw dealTypesError;

  return {
    categories: (categories ?? []).map((category) => ({ id: category.id, label: category.name, value: category.id })),
    stores: (stores ?? []).map((store) => ({ id: store.id, label: store.name, value: store.id })),
    dealTypes: (dealTypes ?? []).map((dealType) => ({ id: dealType.id, label: dealType.name, value: dealType.id, code: dealType.code })),
  };
}
