import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import { normalizeUsername } from '@/features/profile/identity';
import type { PublicProfile, PublicProfileComment, PublicProfileDeal } from '@/features/profile/public-profile.types';

type RawPublicProfileDeal = Omit<PublicProfileDeal, 'stores'> & {
  stores: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function toRelationValue<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export const getPublicProfileByUsername = cache(async (username: string): Promise<PublicProfile | null> => {
  const supabase = await createClient();
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, display_name, first_name, last_name, avatar_url, created_at')
    .ilike('username', normalizedUsername)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile?.username) {
    return null;
  }

  const [{ count: approvedDealsCount, error: dealsCountError }, { count: commentsCount, error: commentsCountError }] = await Promise.all([
    supabase.from('deals').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id).eq('moderation_status', 'approved'),
    supabase.from('deal_comments').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id).eq('is_deleted', false),
  ]);

  if (dealsCountError) {
    throw dealsCountError;
  }

  if (commentsCountError) {
    throw commentsCountError;
  }

  return {
    ...profile,
    username: profile.username,
    approved_deals_count: approvedDealsCount ?? 0,
    comments_count: commentsCount ?? 0,
  };
});

export async function getPublicProfileDeals(profileId: string, limit = 12): Promise<PublicProfileDeal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deals')
    .select('id, slug, title, created_at, score, comments_count, sale_price, original_price, currency_code, stores:stores!deals_store_id_fkey(name, slug)')
    .eq('profile_id', profileId)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return ((data ?? []) as RawPublicProfileDeal[]).map((deal) => ({
    ...deal,
    stores: toRelationValue(deal.stores),
  }));
}

type RawPublicProfileCommentRow = {
  id: string;
  body: string;
  created_at: string;
  deals:
    | {
        id: string;
        slug: string;
        title: string;
        moderation_status: string;
      }
    | {
        id: string;
        slug: string;
        title: string;
        moderation_status: string;
      }[]
    | null;
};

export async function getPublicProfileComments(profileId: string, limit = 12): Promise<PublicProfileComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deal_comments')
    .select('id, body, created_at, deals!inner(id, slug, title, moderation_status)')
    .eq('profile_id', profileId)
    .eq('is_deleted', false)
    .eq('deals.moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return ((data ?? []) as RawPublicProfileCommentRow[])
    .map((comment) => ({
      ...comment,
      deals: toRelationValue(comment.deals),
    }))
    .filter((comment) => Boolean(comment.deals?.slug))
    .map((comment) => ({
      id: comment.id,
      body: comment.body,
      created_at: comment.created_at,
      deal: {
        slug: comment.deals?.slug ?? '',
        title: comment.deals?.title ?? 'Deal',
      },
    }));
}
