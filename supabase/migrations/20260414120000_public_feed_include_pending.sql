-- Ensure signed-out users can still browse recently submitted deals
-- while moderation tooling is in place.

drop policy if exists "deals_select_public_approved" on public.deals;
create policy "deals_select_public_approved"
on public.deals
for select
to anon, authenticated
using (
  moderation_status in ('approved', 'pending')
  or profile_id = auth.uid()
  or public.is_moderator_or_admin()
);
