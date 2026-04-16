alter table public.deals
  add column if not exists availability_scope text not null default 'worldwide',
  add column if not exists availability_region text,
  add column if not exists availability_country_code char(2);

update public.deals
set
  availability_scope = coalesce(availability_scope, 'worldwide'),
  availability_region = null,
  availability_country_code = null
where availability_scope is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'deals_availability_scope_check'
      and conrelid = 'public.deals'::regclass
  ) then
    alter table public.deals
      add constraint deals_availability_scope_check
      check (availability_scope in ('worldwide', 'region', 'country'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'deals_availability_value_check'
      and conrelid = 'public.deals'::regclass
  ) then
    alter table public.deals
      add constraint deals_availability_value_check
      check (
        (availability_scope = 'worldwide' and availability_region is null and availability_country_code is null)
        or (availability_scope = 'region' and availability_region is not null and availability_country_code is null)
        or (availability_scope = 'country' and availability_region is null and availability_country_code is not null)
      );
  end if;
end
$$;

create index if not exists deals_availability_scope_idx on public.deals (availability_scope);
create index if not exists deals_availability_region_idx on public.deals (availability_region) where availability_scope = 'region';
create index if not exists deals_availability_country_idx on public.deals (availability_country_code) where availability_scope = 'country';
