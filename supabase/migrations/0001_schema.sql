-- 0001_schema.sql : Digital Menu Platform core schema
-- Run in Supabase Dashboard > SQL Editor (or via supabase CLI).

create extension if not exists "pgcrypto";

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create type public.order_status as enum
  ('pending','confirmed','preparing','ready','completed','cancelled');

-- ---------- profiles ----------
create table public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- restaurants ----------
create table public.restaurants (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name              text not null check (char_length(name) between 1 and 120),
  slug              text not null unique
                      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  description       text,
  logo_url          text,
  cover_image_url   text,
  phone             text,
  whatsapp_number   text,
  email             text,
  address           text,
  city              text,
  state             text,
  country           text,
  currency          text not null default 'INR',
  timezone          text not null default 'Asia/Kolkata',  -- IANA name; controls open/closed status
  opening_time      time,
  closing_time      time,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index restaurants_owner_idx on public.restaurants(owner_id);

-- ---------- categories ----------
create table public.categories (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null references public.restaurants(id) on delete cascade,
  name            text not null check (char_length(name) between 1 and 80),
  description     text,
  image_url       text,
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index categories_restaurant_order_idx on public.categories(restaurant_id, display_order);

-- ---------- menu_items ----------
create table public.menu_items (
  id                uuid primary key default gen_random_uuid(),
  restaurant_id     uuid not null references public.restaurants(id) on delete cascade,
  category_id       uuid not null references public.categories(id) on delete cascade,
  name              text not null check (char_length(name) between 1 and 120),
  slug              text not null,
  description       text,
  price             numeric(10,2) not null check (price >= 0),
  original_price    numeric(10,2) check (original_price is null or original_price >= 0),
  image_url         text,
  is_available      boolean not null default true,
  is_featured       boolean not null default false,
  is_vegetarian     boolean not null default false,
  is_vegan          boolean not null default false,
  is_non_vegetarian boolean not null default false,
  is_spicy          boolean not null default false,
  preparation_time  integer check (preparation_time is null or preparation_time >= 0), -- minutes
  calories          integer check (calories is null or calories >= 0),
  display_order     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (restaurant_id, slug),
  check (not (is_vegetarian and is_non_vegetarian))
);
create index menu_items_restaurant_idx on public.menu_items(restaurant_id);
create index menu_items_category_order_idx on public.menu_items(category_id, display_order);

-- ---------- item_variants ----------
-- restaurant_id is denormalised so RLS stays simple and fast.
create table public.item_variants (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id   uuid not null references public.menu_items(id) on delete cascade,
  name           text not null,
  price          numeric(10,2) not null check (price >= 0),
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);
create index item_variants_item_idx on public.item_variants(menu_item_id, display_order);

-- ---------- add_ons ----------
create table public.add_ons (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id   uuid not null references public.menu_items(id) on delete cascade,
  name           text not null,
  price          numeric(10,2) not null default 0 check (price >= 0),
  is_available   boolean not null default true,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);
create index add_ons_item_idx on public.add_ons(menu_item_id, display_order);

-- ---------- tables ----------
create table public.tables (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  table_number   text not null,
  qr_token       uuid not null default gen_random_uuid() unique,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (restaurant_id, table_number)
);

-- ---------- restaurant_settings (1:1 with restaurants) ----------
create table public.restaurant_settings (
  id                      uuid primary key default gen_random_uuid(),
  restaurant_id           uuid not null unique references public.restaurants(id) on delete cascade,
  primary_color           text not null default '#111827',
  secondary_color         text not null default '#F9FAFB',
  accent_color            text not null default '#F59E0B',
  font_family             text not null default 'Inter',
  menu_style              text not null default 'cards',
  show_prices             boolean not null default true,
  show_images             boolean not null default true,
  show_descriptions       boolean not null default true,
  show_calories           boolean not null default false,
  show_unavailable_items  boolean not null default true,
  enable_ordering         boolean not null default false,
  enable_whatsapp         boolean not null default true,
  enable_call_waiter      boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------- orders (prepared for later; ordering disabled by default) ----------
create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null references public.restaurants(id) on delete cascade,
  table_id        uuid references public.tables(id) on delete set null,
  customer_name   text,
  customer_phone  text,
  status          public.order_status not null default 'pending',
  subtotal        numeric(10,2) not null default 0 check (subtotal >= 0),
  tax             numeric(10,2) not null default 0 check (tax >= 0),
  discount        numeric(10,2) not null default 0 check (discount >= 0),
  total           numeric(10,2) not null default 0 check (total >= 0),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index orders_restaurant_created_idx on public.orders(restaurant_id, created_at desc);

create table public.order_items (
  id                  uuid primary key default gen_random_uuid(),
  restaurant_id       uuid not null references public.restaurants(id) on delete cascade,
  order_id            uuid not null references public.orders(id) on delete cascade,
  menu_item_id        uuid references public.menu_items(id) on delete set null,
  item_name_snapshot  text not null,
  quantity            integer not null check (quantity > 0),
  unit_price          numeric(10,2) not null check (unit_price >= 0),
  total_price         numeric(10,2) not null check (total_price >= 0),
  notes               text,
  created_at          timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);

-- ---------- analytics_events ----------
create table public.analytics_events (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  event_type     text not null check (event_type in (
                   'menu_view','category_view','item_view','search',
                   'whatsapp_click','call_click','order_started','order_completed')),
  menu_item_id   uuid references public.menu_items(id) on delete set null,
  table_id       uuid references public.tables(id) on delete set null,
  session_id     text,          -- random per-visit id, no personal data
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);
create index analytics_restaurant_created_idx on public.analytics_events(restaurant_id, created_at desc);
create index analytics_restaurant_type_idx on public.analytics_events(restaurant_id, event_type);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','restaurants','categories','menu_items','tables',
                           'restaurant_settings','orders']
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- auto-create default settings for each new restaurant ----------
create or replace function public.handle_new_restaurant()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.restaurant_settings (restaurant_id) values (new.id)
  on conflict (restaurant_id) do nothing;
  return new;
end $$;

create trigger on_restaurant_created
  after insert on public.restaurants
  for each row execute function public.handle_new_restaurant();
