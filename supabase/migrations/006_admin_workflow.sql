alter table public.recipes
  add column if not exists status text not null default 'published'
  check (status in ('draft', 'published'));

create table if not exists public.recipe_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

insert into public.recipe_categories (name)
values ('Сніданки'), ('Супи'), ('Основні страви'), ('Випічка'), ('Десерти'), ('Напої')
on conflict (name) do nothing;

alter table public.recipe_categories enable row level security;

create policy "categories are publicly readable"
  on public.recipe_categories for select using (true);

create policy "authenticated users manage categories"
  on public.recipe_categories for all to authenticated
  using (true) with check (true);
