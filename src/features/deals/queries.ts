import { createClient } from '@/lib/supabase/server';

import {
  DEAL_FEED_PAGE_SIZE,
  DEAL_SORT_OPTIONS,
  type DealFeedCursor,
  type DealFeedFilters,
  type DealSortOption,
  type FeedFacetCollections,
  type PublicDeal,
} from '@/features/deals/types';

const MAX_PAGE_SIZE = 50;
const DEAL_FEED_SELECT = `
  id,
  title,
  description,
  created_at,
  expires_at,
  deal_url,
  image_url,
  merchant_name,
  score,
  hot_score,
  comments_count,
  sale_price,
  original_price,
  discount_percent,
  coupon_code,
  bundle_text,
  currency_code,
  stores:stores!deals_store_id_fkey(name, slug),
  categories:categories!deals_category_id_fkey(name, slug),
  deal_types:deal_types!deals_deal_type_id_fkey(name, code),
  profiles:profiles!deals_profile_id_fkey(username, display_name, first_name, last_name, avatar_url)
`;

type RawDeal = Omit<PublicDeal, 'stores' | 'categories' | 'deal_types' | 'profiles'> & {
  stores: { name: string; slug: string } | { name: string; slug: string }[] | null;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  deal_types: { name: string; code: string } | { name: string; code: string }[] | null;
  profiles:
    | { username: string | null; display_name: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null }
    | {
        username: string | null;
        display_name: string | null;
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

function toRelationValue<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function decodeCursor(raw: string | undefined): DealFeedCursor | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as DealFeedCursor;

    if (!parsed?.createdAt || !parsed?.id || typeof parsed.score !== 'number') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function encodeCursor(cursor: DealFeedCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function normalizedSort(input: string | undefined): DealSortOption {
  if (!input) {
    return 'newest';
  }

  return DEAL_SORT_OPTIONS.includes(input as DealSortOption) ? (input as DealSortOption) : 'newest';
}

function normalizeDeals(rows: RawDeal[]): PublicDeal[] {
  return rows.map((row) => ({
    ...row,
    sale_price: toNullableNumber(row.sale_price),
    original_price: toNullableNumber(row.original_price),
    discount_percent: toNullableNumber(row.discount_percent),
    stores: toRelationValue(row.stores),
    categories: toRelationValue(row.categories),
    deal_types: toRelationValue(row.deal_types),
    profiles: toRelationValue(row.profiles),
    current_user_vote: 0,
    is_saved_by_current_user: false,
  }));
}

function applyCursorFilters<T extends { or: (filters: string) => T }>(query: T, sort: DealSortOption, cursor?: DealFeedCursor | null): T {
  if (!cursor) {
    return query;
  }

  if (sort === 'newest') {
    return query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`);
  }

  if (sort === 'hot') {
    return query.or(
      [
        `hot_score.lt.${cursor.score}`,
        `and(hot_score.eq.${cursor.score},created_at.lt.${cursor.createdAt})`,
        `and(hot_score.eq.${cursor.score},created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
      ].join(','),
    );
  }

  return query.or(
    [
      `comments_count.lt.${cursor.score}`,
      `and(comments_count.eq.${cursor.score},created_at.lt.${cursor.createdAt})`,
      `and(comments_count.eq.${cursor.score},created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    ].join(','),
  );
}

function sanitizeSearchQuery(input: string | undefined): string | undefined {
  if (!input) {
    return undefined;
  }

  const normalized = input.trim().replace(/\s+/g, ' ');
  return normalized.length > 0 ? normalized : undefined;
}

function escapeIlikeValue(value: string): string {
  return value.replace(/[,%_]/g, (char) => `\\${char}`);
}

export function parseFeedQueryParams(params: Record<string, string | string[] | undefined>) {
  const getParam = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    sort: normalizedSort(getParam('sort')),
    cursor: decodeCursor(getParam('cursor')),
    filters: {
      query: sanitizeSearchQuery(getParam('q')),
      category: getParam('category'),
      store: getParam('store'),
      dealType: getParam('dealType'),
    } satisfies DealFeedFilters,
  };
}

export async function getFeedFacets(): Promise<FeedFacetCollections> {
  const supabase = await createClient();

  const [{ data: categories, error: categoriesError }, { data: stores, error: storesError }, { data: dealTypes, error: dealTypesError }] =
    await Promise.all([
      supabase.from('categories').select('slug, name').eq('is_active', true).order('name', { ascending: true }),
      supabase.from('stores').select('slug, name').eq('is_active', true).order('name', { ascending: true }),
      supabase.from('deal_types').select('code, name').eq('is_active', true).order('name', { ascending: true }),
    ]);

  if (categoriesError) throw categoriesError;
  if (storesError) throw storesError;
  if (dealTypesError) throw dealTypesError;

  return {
    categories: (categories ?? []).map((entry) => ({ value: entry.slug, label: entry.name })),
    stores: (stores ?? []).map((entry) => ({ value: entry.slug, label: entry.name })),
    dealTypes: (dealTypes ?? []).map((entry) => ({ value: entry.code, label: entry.name })),
  };
}

export async function getPublicDealsFeed({
  sort,
  filters,
  cursor,
  pageSize = DEAL_FEED_PAGE_SIZE,
}: {
  sort: DealSortOption;
  filters: DealFeedFilters;
  cursor?: DealFeedCursor | null;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const safePageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);

  let query = supabase.from('deals').select(DEAL_FEED_SELECT).eq('moderation_status', 'approved').limit(safePageSize + 1);

  if (filters.category) {
    query = query.eq('categories.slug', filters.category);
  }

  if (filters.store) {
    query = query.eq('stores.slug', filters.store);
  }

  if (filters.dealType) {
    query = query.eq('deal_types.code', filters.dealType);
  }

  if (filters.query) {
    const escapedQuery = escapeIlikeValue(filters.query);
    query = query.or(
      [
        `title.ilike.%${escapedQuery}%`,
        `description.ilike.%${escapedQuery}%`,
        `merchant_name.ilike.%${escapedQuery}%`,
      ].join(','),
    );
  }

  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
  }

  if (sort === 'hot') {
    query = query.order('hot_score', { ascending: false }).order('created_at', { ascending: false }).order('id', { ascending: false });
  }

  if (sort === 'discussed') {
    query = query.order('comments_count', { ascending: false }).order('created_at', { ascending: false }).order('id', { ascending: false });
  }

  query = applyCursorFilters(query, sort, cursor);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = normalizeDeals((data ?? []) as RawDeal[]);
  const hasMore = rows.length > safePageSize;
  const items = hasMore ? rows.slice(0, safePageSize) : rows;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profileId = user?.id ?? null;

  if (profileId && items.length > 0) {
    const dealIds = items.map((deal) => deal.id);

    const [{ data: votes, error: votesError }, { data: bookmarks, error: bookmarksError }] = await Promise.all([
      supabase.from('deal_votes').select('deal_id, vote_value').eq('profile_id', profileId).in('deal_id', dealIds),
      supabase.from('deal_bookmarks').select('deal_id').eq('profile_id', profileId).in('deal_id', dealIds),
    ]);

    if (votesError) {
      throw votesError;
    }

    if (bookmarksError) {
      throw bookmarksError;
    }

    const voteMap = new Map((votes ?? []).map((vote) => [vote.deal_id, vote.vote_value as -1 | 1]));
    const bookmarkedDealIds = new Set((bookmarks ?? []).map((bookmark) => bookmark.deal_id));

    for (const deal of items) {
      deal.current_user_vote = voteMap.get(deal.id) ?? 0;
      deal.is_saved_by_current_user = bookmarkedDealIds.has(deal.id);
    }
  }

  const last = items.at(-1);

  let nextCursor: string | null = null;

  if (hasMore && last) {
    nextCursor =
      sort === 'newest'
        ? encodeCursor({ score: 0, createdAt: last.created_at, id: last.id })
        : sort === 'hot'
          ? encodeCursor({ score: last.hot_score, createdAt: last.created_at, id: last.id })
          : encodeCursor({ score: last.comments_count, createdAt: last.created_at, id: last.id });
  }

  return {
    items,
    hasMore,
    nextCursor,
  };
}
