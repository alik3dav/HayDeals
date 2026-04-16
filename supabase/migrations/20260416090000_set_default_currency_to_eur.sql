-- Switch default deal currency from AMD to EUR and migrate existing defaulted records.
alter table public.deals
  alter column currency_code set default 'EUR';

update public.deals
set currency_code = 'EUR'
where currency_code = 'AMD';
