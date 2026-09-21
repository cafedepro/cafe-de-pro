-- Fills in real details for the Marabi restaurant and seeds its menu
-- with categories and items based on public listing data. Prices below
-- are placeholders (₹) — edit them to the real prices in the admin panel
-- once you have them; everything else here is safe to keep as-is.

-- 1. Restaurant details
update public.restaurants
set
  address = 'S Bazaar - Kannothumchal Rd, South Bazar, Puzhathi Housing Colony, Kannur, Kerala 670002',
  phone = '+918129322997',
  opening_time = '11:30',
  closing_time = '01:00',
  description = 'Authentic Arabian Kuzhimandi and Middle Eastern favorites in the heart of Kannur.'
where slug = 'marabi';

-- 2. Categories
insert into public.categories (restaurant_id, name, display_order)
select id, 'Mandi', 0 from public.restaurants where slug = 'marabi';

insert into public.categories (restaurant_id, name, display_order)
select id, 'Sides', 1 from public.restaurants where slug = 'marabi';

insert into public.categories (restaurant_id, name, display_order)
select id, 'Drinks', 2 from public.restaurants where slug = 'marabi';

-- 3. Menu items — Mandi
insert into public.menu_items (restaurant_id, category_id, name, slug, price, is_available, display_order)
select r.id, c.id, v.name, lower(regexp_replace(v.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 4), v.price, true, v.ord
from public.restaurants r
join public.categories c on c.restaurant_id = r.id and c.name = 'Mandi'
join (values
  ('Normal Al Faham Mandi', 280, 0),
  ('Kanthari Al Faham Mandi', 290, 1),
  ('Peri Peri Mandi', 300, 2),
  ('Honey Pepper Al Faham Mandi', 300, 3),
  ('Mexican Tawa Mandi', 310, 4),
  ('Jallikattu Chicken Mandi', 320, 5)
) as v(name, price, ord) on true
where r.slug = 'marabi';

-- 4. Menu items — Sides
insert into public.menu_items (restaurant_id, category_id, name, slug, price, is_available, display_order)
select r.id, c.id, v.name, lower(regexp_replace(v.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 4), v.price, true, v.ord
from public.restaurants r
join public.categories c on c.restaurant_id = r.id and c.name = 'Sides'
join (values
  ('Rumali Roti', 40, 0),
  ('Russian Salad', 120, 1)
) as v(name, price, ord) on true
where r.slug = 'marabi';

-- 5. Menu items — Drinks
insert into public.menu_items (restaurant_id, category_id, name, slug, price, is_available, display_order)
select r.id, c.id, v.name, lower(regexp_replace(v.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 4), v.price, true, v.ord
from public.restaurants r
join public.categories c on c.restaurant_id = r.id and c.name = 'Drinks'
join (values
  ('Passion Soda', 90, 0),
  ('Falooda', 110, 1)
) as v(name, price, ord) on true
where r.slug = 'marabi';
