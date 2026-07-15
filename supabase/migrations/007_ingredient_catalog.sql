create table if not exists public.ingredient_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);

alter table public.ingredient_catalog enable row level security;

create policy "ingredient catalog is publicly readable"
  on public.ingredient_catalog for select using (true);

create policy "authenticated users manage ingredient catalog"
  on public.ingredient_catalog for all to authenticated
  using (true) with check (true);

insert into public.ingredient_catalog (name)
select distinct lower(trim(item->>'name'))
from public.recipes
cross join lateral jsonb_array_elements(coalesce(structured_ingredients, '[]'::jsonb)) item
where nullif(trim(item->>'name'), '') is not null
on conflict (name) do nothing;
