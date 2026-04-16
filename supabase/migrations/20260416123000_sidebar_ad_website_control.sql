alter table public.website_control_settings
  add column if not exists sidebar_ad_background_image_url text,
  add column if not exists sidebar_ad_title text,
  add column if not exists sidebar_ad_description text,
  add column if not exists sidebar_ad_button_text text,
  add column if not exists sidebar_ad_image_only boolean not null default false;
