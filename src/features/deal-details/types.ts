export type DealDetail = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  created_at: string;
  deal_url: string;
  image_url: string | null;
  coupon_code: string | null;
  merchant_name: string | null;
  currency_code: string;
  sale_price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  score: number;
  upvotes_count: number;
  downvotes_count: number;
  comments_count: number;
  bookmarks_count: number;
  reports_count: number;
  deal_types: {
    name: string;
    code: string;
  } | null;
  stores: {
    name: string;
    slug: string;
  } | null;
  categories: {
    name: string;
    slug: string;
  } | null;
  profiles: {
    username: string | null;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type DealComment = {
  id: string;
  deal_id: string;
  profile_id: string;
  body: string;
  is_deleted: boolean;
  created_at: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type RelatedDeal = {
  id: string;
  title: string;
  score: number;
  comments_count: number;
  sale_price: number | null;
  currency_code: string;
};

export type ViewerDealState = {
  currentVote: -1 | 0 | 1;
  isSaved: boolean;
};
