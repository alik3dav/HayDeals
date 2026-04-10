-- Ensure public feed lookups are readable by anon/authenticated roles.

-- Lookup tables are used for public filters and relational joins from deals.
grant select on table public.categories to anon, authenticated;
grant select on table public.stores to anon, authenticated;
grant select on table public.deal_types to anon, authenticated;

-- Deals select remains constrained by RLS policies.
grant select on table public.deals to anon, authenticated;
