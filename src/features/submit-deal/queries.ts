import { createClient } from '@/lib/supabase/server';
import { DEAL_TYPE_CONFIG, isDealTypeCode } from '@/features/submit-deal/deal-type-config';

import type { SubmitDealMeta } from '@/features/submit-deal/types';

export async function getSubmitDealMeta(): Promise<SubmitDealMeta> {
  const supabase = await createClient();

  const [categoriesResult, storesResult, dealTypesResult] = await Promise.all([
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name', { ascending: true }),
    supabase.from('stores').select('id, name, slug').eq('is_active', true).order('name', { ascending: true }),
    supabase.from('deal_types').select('id, name, code').eq('is_active', true).order('name', { ascending: true }),
  ]);

  const categories = categoriesResult.data ?? [];
  const stores = storesResult.data ?? [];
  const dealTypes = (dealTypesResult.data ?? []).flatMap((dealType) => {
    const code = String(dealType.code);

    if (!isDealTypeCode(code)) {
      return [];
    }

    return [{ ...dealType, code }];
  });

  if (dealTypesResult.error) throw dealTypesResult.error;

  return {
    categories: categories.map((category) => ({ id: category.id, label: category.name, value: category.id })),
    stores: stores.map((store) => ({ id: store.id, label: store.name, value: store.id })),
    dealTypes: dealTypes.map((dealType) => ({
      id: dealType.id,
      label: DEAL_TYPE_CONFIG[dealType.code].label,
      value: dealType.id,
      code: dealType.code,
    })),
  };
}
