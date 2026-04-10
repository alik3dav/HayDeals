# Supabase schema notes (v1)

- `profiles` is linked 1:1 to `auth.users` by UUID primary key (`profiles.id = auth.users.id`).
- `deals` uses a single table with `deal_type_id` so all deal kinds (discount, coupon, cashback, etc.) share one scalable model.
- The `deals` table includes core commerce/moderation fields: pricing, coupon, link, merchant, expiration windows, moderation status, and denormalized counters for feed performance.
- Feed sorting is supported by dedicated partial indexes for approved deals:
  - **new**: `created_at desc`
  - **hot**: `hot_score desc, created_at desc`
  - **discussed**: `comments_count desc, created_at desc`
- `deal_votes`, `deal_bookmarks` enforce one row per user per deal using unique constraints.
- Every table has `created_at` + `updated_at`, and `updated_at` is maintained with a shared trigger function (`set_updated_at`).
