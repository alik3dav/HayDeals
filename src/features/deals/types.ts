export const DEAL_FEED_PAGE_SIZE = 20;

export const DEAL_SORT_OPTIONS = ['newest', 'hot', 'discussed'] as const;

export type DealSortOption = (typeof DEAL_SORT_OPTIONS)[number];

export type DealFeedFilters = {
  category?: string;
  store?: string;
  dealType?: string;
};

export type DealFeedCursor = {
  score: number;
  createdAt: string;
  id: string;
};

export type PublicDeal = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  expires_at: string | null;
  deal_url: string;
  image_url: string | null;
  score: number;
  hot_score: number;
  comments_count: number;
  sale_price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  coupon_code: string | null;
  bundle_text: string | null;
  currency_code: string;
  stores: {
    name: string;
    slug: string;
  } | null;
  categories: {
    name: string;
    slug: string;
  } | null;
  deal_types: {
    name: string;
    code: string;
  } | null;
};

export type FeedFacetOption = {
  label: string;
  value: string;
};

export type FeedFacetCollections = {
  categories: FeedFacetOption[];
  stores: FeedFacetOption[];
  dealTypes: FeedFacetOption[];
};
