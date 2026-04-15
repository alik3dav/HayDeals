import { createClient } from '@/lib/supabase/server';
import type { DealComment, DealDetail, RelatedDeal, ViewerDealState } from '@/features/deal-details/types';

type RawDealDetail = Omit<DealDetail, 'stores' | 'categories' | 'deal_types'> & {
  stores: { name: string; slug: string }[] | null;
  categories: { name: string; slug: string }[] | null;
  deal_types: { name: string; code: string }[] | null;
};

export async function getDealDetailById(dealId: string): Promise<DealDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('deals')
    .select(
      `
      id,
      title,
      description,
      created_at,
      deal_url,
      image_url,
      coupon_code,
      merchant_name,
      currency_code,
      sale_price,
      original_price,
      discount_percent,
      score,
      upvotes_count,
      downvotes_count,
      comments_count,
      bookmarks_count,
      reports_count,
      deal_types:deal_types!deals_deal_type_id_fkey(name, code),
      stores:stores!deals_store_id_fkey(name, slug),
      categories:categories!deals_category_id_fkey(name, slug)
    `,
    )
    .eq('id', dealId)
    .single<RawDealDetail>();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return {
    ...data,
    stores: data.stores?.[0] ?? null,
    categories: data.categories?.[0] ?? null,
    deal_types: data.deal_types?.[0] ?? null,
  };
}

export async function getDealComments(dealId: string): Promise<DealComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deal_comments')
    .select('id, deal_id, profile_id, body, is_deleted, created_at')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: true })
    .limit(250);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getViewerDealState(dealId: string, profileId: string | null): Promise<ViewerDealState> {
  if (!profileId) {
    return { currentVote: 0, isSaved: false };
  }

  const supabase = await createClient();

  const [{ data: voteData, error: voteError }, { data: bookmarkData, error: bookmarkError }] = await Promise.all([
    supabase.from('deal_votes').select('vote_value').eq('deal_id', dealId).eq('profile_id', profileId).maybeSingle(),
    supabase.from('deal_bookmarks').select('id').eq('deal_id', dealId).eq('profile_id', profileId).maybeSingle(),
  ]);

  if (voteError) {
    throw voteError;
  }

  if (bookmarkError) {
    throw bookmarkError;
  }

  const voteValue = voteData?.vote_value;
  return {
    currentVote: voteValue === 1 || voteValue === -1 ? voteValue : 0,
    isSaved: Boolean(bookmarkData?.id),
  };
}

export async function getRelatedDeals(deal: DealDetail): Promise<RelatedDeal[]> {
  const supabase = await createClient();

  let query = supabase
    .from('deals')
    .select('id, title, score, comments_count, sale_price, currency_code')
    .neq('id', deal.id)
    .eq('moderation_status', 'approved')
    .limit(4)
    .order('hot_score', { ascending: false });

  if (deal.categories?.slug) {
    const { data: categoryRow } = await supabase.from('categories').select('id').eq('slug', deal.categories.slug).maybeSingle();
    if (categoryRow?.id) {
      query = query.eq('category_id', categoryRow.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}
