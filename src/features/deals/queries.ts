import { createClient } from '@/lib/supabase/server';
import { COUNTRY_SELECT_OPTIONS, REGION_OPTIONS } from '@/features/deals/availability';

import {
  DEAL_FEED_PAGE_SIZE,
  DEAL_SORT_OPTIONS,
  type DealFeedCursor,
  type DealFeedFilters,
  type DealSortOption,
  type FeedFacetCollections,
  type PublicDeal,
  type SidebarCommunityStats,
} from '@/features/deals/types';

const MAX_PAGE_SIZE = 50;
const DEAL_FEED_SELECT = `
  id,
  slug,
  title,
  description,
  created_at,
  expires_at,
  deal_url,
  image_url,
  merchant_name,
  score,
  upvotes_count,
  hot_score,
  comments_count,
  sale_price,
  original_price,
  discount_percent,
  coupon_code,
  bundle_text,
  currency_code,
  availability_scope,
  availability_region,
  availability_country_code,
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

export function decodeFeedCursor(raw: string | undefined): DealFeedCursor | null {
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

type DealVoteStats = {
  upvotes: number;
  downvotes: number;
  score: number;
};

async function getVoteStatsByDealIds(supabase: Awaited<ReturnType<typeof createClient>>, dealIds: string[]) {
  if (dealIds.length === 0) {
    return new Map<string, DealVoteStats>();
  }

  const { data, error } = await supabase.from('deal_votes').select('deal_id, vote_value').in('deal_id', dealIds);

  if (error) {
    throw error;
  }

  const voteTotals = new Map<string, DealVoteStats>();

  for (const vote of data ?? []) {
    const currentTotals = voteTotals.get(vote.deal_id) ?? { upvotes: 0, downvotes: 0, score: 0 };
    const nextTotals =
      vote.vote_value === 1
        ? {
            upvotes: currentTotals.upvotes + 1,
            downvotes: currentTotals.downvotes,
            score: currentTotals.score + 1,
          }
        : {
            upvotes: currentTotals.upvotes,
            downvotes: currentTotals.downvotes + 1,
            score: currentTotals.score - 1,
          };
    voteTotals.set(vote.deal_id, nextTotals);
  }

  return voteTotals;
}

export function parseFeedQueryParams(params: Record<string, string | string[] | undefined>) {
  const getParam = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    sort: normalizedSort(getParam('sort')),
    cursor: decodeFeedCursor(getParam('cursor')),
    filters: {
      query: sanitizeSearchQuery(getParam('q')),
      category: getParam('category'),
      store: getParam('store'),
      dealType: getParam('dealType'),
      availabilityScope: ['worldwide', 'region', 'country'].includes(getParam('availabilityScope') ?? '')
        ? (getParam('availabilityScope') as DealFeedFilters['availabilityScope'])
        : undefined,
      availabilityRegion: getParam('availabilityRegion'),
      availabilityCountry: getParam('availabilityCountry'),
    } satisfies DealFeedFilters,
  };
}

export async function getFeedFacets(): Promise<FeedFacetCollections> {
  const supabase = await createClient();

  const [{ data: categories, error: categoriesError }, { data: stores, error: storesError }, { data: dealTypes, error: dealTypesError }, { data: availabilityRows, error: availabilityError }] =
    await Promise.all([
      supabase.from('categories').select('slug, name').eq('is_active', true).order('name', { ascending: true }),
      supabase.from('stores').select('slug, name').eq('is_active', true).order('name', { ascending: true }),
      supabase.from('deal_types').select('code, name').eq('is_active', true).order('name', { ascending: true }),
      supabase.from('deals').select('availability_scope, availability_region, availability_country_code').eq('moderation_status', 'approved').limit(2000),
    ]);

  if (categoriesError) throw categoriesError;
  if (storesError) throw storesError;
  if (dealTypesError) throw dealTypesError;
  if (availabilityError) throw availabilityError;

  const availableRegions = new Set((availabilityRows ?? []).filter((row) => row.availability_scope === 'region').map((row) => row.availability_region).filter(Boolean));
  const availableCountries = new Set(
    (availabilityRows ?? []).filter((row) => row.availability_scope === 'country').map((row) => row.availability_country_code).filter(Boolean),
  );

  return {
    categories: (categories ?? []).map((entry) => ({ value: entry.slug, label: entry.name })),
    stores: (stores ?? []).map((entry) => ({ value: entry.slug, label: entry.name })),
    dealTypes: (dealTypes ?? []).map((entry) => ({ value: entry.code, label: entry.name })),
    availabilityRegions: REGION_OPTIONS.filter((region) => availableRegions.has(region.value)).map((region) => ({ value: region.value, label: region.label })),
    availabilityCountries: COUNTRY_SELECT_OPTIONS.filter((country) => availableCountries.has(country.value)).map((country) => ({
      value: country.value,
      label: country.label,
    })),
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

  const [categoryId, storeId, dealTypeId] = await Promise.all([
    filters.category
      ? supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .eq('is_active', true)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) throw error;
            return data?.id ?? null;
          })
      : Promise.resolve<string | null>(null),
    filters.store
      ? supabase
          .from('stores')
          .select('id')
          .eq('slug', filters.store)
          .eq('is_active', true)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) throw error;
            return data?.id ?? null;
          })
      : Promise.resolve<string | null>(null),
    filters.dealType
      ? supabase
          .from('deal_types')
          .select('id')
          .eq('code', filters.dealType)
          .eq('is_active', true)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) throw error;
            return data?.id ?? null;
          })
      : Promise.resolve<string | null>(null),
  ]);

  if ((filters.category && !categoryId) || (filters.store && !storeId) || (filters.dealType && !dealTypeId)) {
    return {
      items: [],
      hasMore: false,
      nextCursor: null,
    };
  }

  let query = supabase.from('deals').select(DEAL_FEED_SELECT).eq('moderation_status', 'approved').limit(safePageSize + 1);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  if (dealTypeId) {
    query = query.eq('deal_type_id', dealTypeId);
  }
  if (filters.availabilityScope) {
    query = query.eq('availability_scope', filters.availabilityScope);

    if (filters.availabilityScope === 'region' && filters.availabilityRegion) {
      query = query.eq('availability_region', filters.availabilityRegion);
    }

    if (filters.availabilityScope === 'country' && filters.availabilityCountry) {
      query = query.eq('availability_country_code', filters.availabilityCountry.toUpperCase());
    }
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
  const dealIds = items.map((deal) => deal.id);
  const voteStatsByDealId = await getVoteStatsByDealIds(supabase, dealIds);

  for (const deal of items) {
    const voteStats = voteStatsByDealId.get(deal.id);
    deal.upvotes_count = voteStats?.upvotes ?? 0;
    deal.score = voteStats?.score ?? 0;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profileId = user?.id ?? null;

  if (profileId && items.length > 0) {
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

export async function getSidebarCommunityStats(): Promise<SidebarCommunityStats> {
  const supabase = await createClient();

  const [{ count: profileCount }, { data: recentDeals, error: recentDealsError }] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('deals')
      .select('profiles:profiles!deals_profile_id_fkey(username, display_name, first_name, last_name, avatar_url)')
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (recentDealsError) {
    throw recentDealsError;
  }

  const recentMembers = new Map<string, SidebarCommunityStats['recentMembers'][number]>();

  for (const entry of recentDeals ?? []) {
    const profile = toRelationValue(entry.profiles);
    if (!profile) {
      continue;
    }

    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
    const displayName = profile.display_name ?? fullName ?? profile.username ?? 'Member';
    const memberKey = profile.username ?? displayName;

    if (!memberKey || recentMembers.has(memberKey)) {
      continue;
    }

    recentMembers.set(memberKey, {
      username: profile.username,
      displayName: displayName.length > 0 ? displayName : 'Member',
      avatarUrl: profile.avatar_url,
    });

    if (recentMembers.size >= 3) {
      break;
    }
  }

  return {
    activeMembers: profileCount ?? 0,
    recentMembers: Array.from(recentMembers.values()),
  };
}
