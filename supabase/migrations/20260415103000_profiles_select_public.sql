-- Allow public feed joins to resolve deal author profile info for anonymous visitors.
-- This enables rendering author avatar/name in public deal cards.

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
to anon, authenticated
using (true);
