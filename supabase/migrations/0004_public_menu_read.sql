-- Lets anonymous website visitors read the menu (categories and items)
-- for any restaurant, the same way they can already read the restaurant
-- itself. Without this, the admin owner can see their menu but a customer
-- scanning the QR code sees nothing, because RLS silently returns zero
-- rows instead of an error.

create policy "Public can view active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "Public can view items in active categories"
on public.menu_items
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.categories c
    where c.id = menu_items.category_id
      and c.is_active = true
  )
);
