alter table public.deals
add column if not exists slug text;

create or replace function public.slugify_deal_title(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, 'deal')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.assign_deal_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 2;
begin
  if tg_op = 'INSERT' or new.title is distinct from old.title or coalesce(new.slug, '') = '' then
    base_slug := public.slugify_deal_title(new.title);

    if base_slug is null or base_slug = '' then
      base_slug := 'deal';
    end if;

    candidate_slug := base_slug;

    while exists (
      select 1
      from public.deals d
      where d.slug = candidate_slug
        and d.id <> new.id
    ) loop
      candidate_slug := base_slug || '-' || suffix::text;
      suffix := suffix + 1;
    end loop;

    new.slug := candidate_slug;
  end if;

  return new;
end;
$$;

drop trigger if exists set_deal_slug on public.deals;

create trigger set_deal_slug
before insert or update of title, slug on public.deals
for each row
execute function public.assign_deal_slug();

update public.deals d
set slug = generated.slug
from (
  select id, row_number() over (partition by base_slug order by created_at, id) as slug_rank,
    case
      when row_number() over (partition by base_slug order by created_at, id) = 1 then base_slug
      else base_slug || '-' || row_number() over (partition by base_slug order by created_at, id)::text
    end as slug
  from (
    select id, created_at,
      coalesce(nullif(public.slugify_deal_title(title), ''), 'deal') as base_slug
    from public.deals
  ) ranked
) as generated
where d.id = generated.id
  and (d.slug is null or d.slug = '');

alter table public.deals
alter column slug set not null;

create unique index if not exists deals_slug_key on public.deals (slug);

alter table public.deals
add constraint deals_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
