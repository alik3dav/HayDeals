-- Allow anonymous visitors to read vote rows so public pages can compute total vote counts.
-- User-specific vote state remains restricted by filtering with auth.uid() in app queries.

drop policy if exists "deal_votes_select_authenticated" on public.deal_votes;
drop policy if exists "deal_votes_select_public" on public.deal_votes;

create policy "deal_votes_select_public"
on public.deal_votes
for select
to anon, authenticated
using (true);
