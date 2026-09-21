-- 0002_rls.sql : Row Level Security for multi-tenant isolation

-- ---------- helper functions (security definer avoids recursive RLS) ----------
create or replace function public.owns_restaurant(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.restaurants r
    where r.id = rid and r.owner_id = auth.uid()
  );
$$;

create or replace function public.is_public_restaurant(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.restaurants r
    where r.id = rid and r.is_active = true
  );
$$;

grant execute on function public.owns_restaurant(uuid)       to anon, authenticated;
grant execute on function public.is_public_restaurant(uuid)  to anon, authenticated;

-- ---------- enable RLS everywhere ----------
alter table public.profiles             enable row level security;
alter table public.restaurants          enable row level security;
alter table public.categories           enable row level security;
alter table public.menu_items           enable row level security;
alter table public.item_variants        enable row level security;
alter table public.add_ons              enable row level security;
alter table public.tables               enable row level security;
alter table public.restaurant_settings  enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.analytics_events     enable row level security;

-- ---------- profiles: own row only ----------
create policy profiles_select_own on public.profiles for select to authenticated
  using (user_id = auth.uid());
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (user_id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- restaurants ----------
create policy restaurants_public_read on public.restaurants for select to anon, authenticated
  using (is_active = true);
create policy restaurants_owner_read on public.restaurants for select to authenticated
  using (owner_id = auth.uid());
create policy restaurants_owner_insert on public.restaurants for insert to authenticated
  with check (owner_id = auth.uid());
create policy restaurants_owner_update on public.restaurants for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy restaurants_owner_delete on public.restaurants for delete to authenticated
  using (owner_id = auth.uid());

-- ---------- owner full access on every restaurant-owned table ----------
do $$
declare t text;
begin
  foreach t in array array['categories','menu_items','item_variants','add_ons','tables',
                           'restaurant_settings','orders','order_items']
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.owns_restaurant(restaurant_id))
         with check (public.owns_restaurant(restaurant_id))',
      t || '_owner_all', t);
  end loop;
end $$;

-- ---------- public read of menu data (active restaurants only) ----------
create policy categories_public_read on public.categories for select to anon, authenticated
  using (is_active = true and public.is_public_restaurant(restaurant_id));

create policy menu_items_public_read on public.menu_items for select to anon, authenticated
  using (public.is_public_restaurant(restaurant_id));

create policy item_variants_public_read on public.item_variants for select to anon, authenticated
  using (public.is_public_restaurant(restaurant_id));

create policy add_ons_public_read on public.add_ons for select to anon, authenticated
  using (public.is_public_restaurant(restaurant_id));

create policy settings_public_read on public.restaurant_settings for select to anon, authenticated
  using (public.is_public_restaurant(restaurant_id));

-- ---------- analytics: anyone may write events, only the owner may read ----------
create policy analytics_public_insert on public.analytics_events for insert to anon, authenticated
  with check (public.is_public_restaurant(restaurant_id));
create policy analytics_owner_read on public.analytics_events for select to authenticated
  using (public.owns_restaurant(restaurant_id));

-- NOTE: orders / order_items / tables have NO public policies on purpose.
-- Customer ordering will be added in Phase 9 through a SECURITY DEFINER function
-- that validates items and recalculates prices server-side.
