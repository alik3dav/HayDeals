export type AdminDealQueueItem = {
  id: string;
  title: string;
  moderation_status: 'draft' | 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  reports_count: number;
  created_at: string;
  coupon_code: string | null;
  sale_price: number | null;
  original_price: number | null;
  currency_code: string;
  profiles: { display_name: string | null; username: string | null }[] | null;
  stores: { name: string }[] | null;
  categories: { name: string }[] | null;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

export type AdminStore = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type AdminUser = {
  id: string;
  display_name: string | null;
  username: string | null;
  role: 'user' | 'moderator' | 'admin';
  reputation: number;
  created_at: string;
};

export type AdminReport = {
  id: string;
  reason: string;
  details: string | null;
  report_status: 'open' | 'reviewed' | 'dismissed';
  created_at: string;
  deals: { id: string; title: string }[] | null;
  profiles: { display_name: string | null; username: string | null }[] | null;
};

export type AdminDealEdit = {
  id: string;
  title: string;
  description: string | null;
  deal_url: string;
  coupon_code: string | null;
  moderation_note: string | null;
  sale_price: number | null;
  original_price: number | null;
  expires_at: string | null;
  moderation_status: 'draft' | 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  category_id: string | null;
  store_id: string | null;
  categoryOptions: Array<{ id: string; name: string }>;
  storeOptions: Array<{ id: string; name: string }>;
};

export type WebsiteControlState = {
  ok: boolean;
  message: string;
};
