import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import type { DealComment, DealDetail, RelatedDeal, ViewerDealState } from '@/features/deal-details/types';

type RawDealDetail = Omit<DealDetail, 'stores' | 'categories' | 'deal_types'> & {
  stores: { name: string; slug: string } | { name: string; slug: string }[] | null;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  deal_types: { name: string; code: string } | { name: string; code: string }[] | null;
  profiles:
    | {
        username: string | null;
        display_name: string | null;
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        is_verified: boolean;
      }
    | {
        username: string | null;
        display_name: string | null;
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        is_verified: boolean;
      }[]
    | null;
};

function toRelationValue<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export const getDealDetailBySlug = cache(async (dealSlug: string): Promise<DealDetail | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('deals')
    .select(
      `
      id,
      slug,
      profile_id,
      title,
      description,
      created_at,
      deal_url,
      image_url,
      coupon_code,
      merchant_name,
      currency_code,
      availability_scope,
      availability_region,
      availability_country_code,
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
      categories:categories!deals_category_id_fkey(name, slug),
      profiles:profiles!deals_profile_id_fkey(username, display_name, first_name, last_name, avatar_url, is_verified)
    `,
    )
    .eq('slug', dealSlug)
    .single<RawDealDetail>();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  const { data: voteData, error: voteError } = await supabase.from('deal_votes').select('vote_value').eq('deal_id', data.id);

  if (voteError) {
    throw voteError;
  }

  let upvotesCount = 0;
  let downvotesCount = 0;

  for (const vote of voteData ?? []) {
    if (vote.vote_value === 1) {
      upvotesCount += 1;
      continue;
    }

    if (vote.vote_value === -1) {
      downvotesCount += 1;
    }
  }

  return {
    ...data,
    score: upvotesCount - downvotesCount,
    upvotes_count: upvotesCount,
    downvotes_count: downvotesCount,
    stores: toRelationValue(data.stores),
    categories: toRelationValue(data.categories),
    deal_types: toRelationValue(data.deal_types),
    profiles: toRelationValue(data.profiles),
  };
});

export async function getDealComments(dealId: string): Promise<DealComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deal_comments')
    .select(
      'id, deal_id, profile_id, body, is_deleted, created_at, profiles:profiles!deal_comments_profile_id_fkey(username, display_name, first_name, last_name, avatar_url, is_verified)',
    )
    .eq('deal_id', dealId)
    .order('created_at', { ascending: true })
    .limit(250);

  if (error) {
    throw error;
  }

  return (data ?? []).map((comment) => ({
    ...comment,
    profiles: Array.isArray(comment.profiles) ? (comment.profiles[0] ?? null) : comment.profiles,
  }));
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
    .select('id, slug, title, score, comments_count, sale_price, currency_code')
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
