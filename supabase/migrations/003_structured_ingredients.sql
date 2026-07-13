alter table public.recipes
add column if not exists structured_ingredients jsonb;

comment on column public.recipes.structured_ingredients is
'Array of {name, canonicalName, amount, unit}; legacy ingredients remains supported during migration.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recipes_structured_ingredients_is_array'
  ) then
    alter table public.recipes
    add constraint recipes_structured_ingredients_is_array
    check (
      structured_ingredients is null
      or jsonb_typeof(structured_ingredients) = 'array'
    ) not valid;
  end if;
end
$$;

alter table public.recipes
validate constraint recipes_structured_ingredients_is_array;
