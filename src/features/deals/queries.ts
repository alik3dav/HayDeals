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
type RawDeal = Omit<PublicDeal, 'stores' | 'categories' | 'deal_types'> & {
  stores: { name: string; slug: string }[] | null;
  categories: { name: string; slug: string }[] | null;
  deal_types: { name: string; code: string }[] | null;
};

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

export function parseFeedQueryParams(params: Record<string, string | string[] | undefined>) {
  const getParam = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    sort: normalizedSort(getParam('sort')),
    cursor: decodeCursor(getParam('cursor')),
    filters: {
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

  let query = supabase
    .from('deals')
    .select(
      `
      id,
      title,
      description,
      created_at,
      deal_url,
      image_url,
      score,
      hot_score,
      comments_count,
      sale_price,
      original_price,
      discount_percent,
      currency_code,
      stores:stores!deals_store_id_fkey(name, slug),
      categories:categories!deals_category_id_fkey(name, slug),
      deal_types:deal_types!deals_deal_type_id_fkey(name, code)
    `,
    )
    .limit(safePageSize + 1);

  if (filters.category) {
    query = query.eq('categories.slug', filters.category);
  }

  if (filters.store) {
    query = query.eq('stores.slug', filters.store);
  }

  if (filters.dealType) {
    query = query.eq('deal_types.code', filters.dealType);
  }

  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false }).order('id', { ascending: false });

    if (cursor) {
      query = query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`);
    }
  }

  if (sort === 'hot') {
    query = query.order('hot_score', { ascending: false }).order('created_at', { ascending: false }).order('id', { ascending: false });

    if (cursor) {
      query = query.or(
        [
          `hot_score.lt.${cursor.score}`,
          `and(hot_score.eq.${cursor.score},created_at.lt.${cursor.createdAt})`,
          `and(hot_score.eq.${cursor.score},created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
        ].join(','),
      );
    }
  }

  if (sort === 'discussed') {
    query = query.order('comments_count', { ascending: false }).order('created_at', { ascending: false }).order('id', { ascending: false });

    if (cursor) {
      query = query.or(
        [
          `comments_count.lt.${cursor.score}`,
          `and(comments_count.eq.${cursor.score},created_at.lt.${cursor.createdAt})`,
          `and(comments_count.eq.${cursor.score},created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
        ].join(','),
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as RawDeal[]).map((row) => ({
    ...row,
    stores: row.stores?.[0] ?? null,
    categories: row.categories?.[0] ?? null,
    deal_types: row.deal_types?.[0] ?? null,
  }));
  const hasMore = rows.length > safePageSize;
  const items = hasMore ? rows.slice(0, safePageSize) : rows;
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
