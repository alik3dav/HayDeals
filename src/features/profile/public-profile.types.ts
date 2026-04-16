export type PublicProfile = {
  id: string;
  username: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  approved_deals_count: number;
  comments_count: number;
};

export type PublicProfileDeal = {
  id: string;
  slug: string;
  title: string;
  created_at: string;
  score: number;
  comments_count: number;
  sale_price: number | null;
  original_price: number | null;
  currency_code: string;
  stores: {
    name: string;
    slug: string;
  } | null;
};

export type PublicProfileComment = {
  id: string;
  body: string;
  created_at: string;
  deal: {
    slug: string;
    title: string;
  };
};
