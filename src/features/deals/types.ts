export const DEAL_FEED_PAGE_SIZE = 15;

export const DEAL_SORT_OPTIONS = ['newest', 'hot', 'discussed'] as const;

export type DealSortOption = (typeof DEAL_SORT_OPTIONS)[number];

export type DealFeedFilters = {
  query?: string;
  category?: string;
  store?: string;
  dealType?: string;
  availabilityScope?: 'worldwide' | 'region' | 'country';
  availabilityRegion?: string;
  availabilityCountry?: string;
};

export type DealFeedCursor = {
  score: number;
  createdAt: string;
  id: string;
};

export type PublicDeal = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  created_at: string;
  expires_at: string | null;
  deal_url: string;
  image_url: string | null;
  merchant_name: string | null;
  score: number;
  upvotes_count: number;
  hot_score: number;
  comments_count: number;
  sale_price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  coupon_code: string | null;
  bundle_text: string | null;
  currency_code: string;
  availability_scope: 'worldwide' | 'region' | 'country';
  availability_region: string | null;
  availability_country_code: string | null;
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
  profiles: {
    username: string | null;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  current_user_vote: -1 | 0 | 1;
  is_saved_by_current_user: boolean;
};

export type FeedFacetOption = {
  label: string;
  value: string;
};

export type FeedFacetCollections = {
  categories: FeedFacetOption[];
  stores: FeedFacetOption[];
  dealTypes: FeedFacetOption[];
  availabilityRegions: FeedFacetOption[];
  availabilityCountries: FeedFacetOption[];
};

export type SidebarCommunityMember = {
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export type SidebarCommunityStats = {
  activeMembers: number;
  recentMembers: SidebarCommunityMember[];
};
