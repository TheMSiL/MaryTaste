update public.recipes
set
  ingredients = '["Картопля 550 г","Грудинка 200 г","Твердий сир 180 г","Цибуля 100 г","Часник","Вершки 300 г","Спеції за смаком"]'::jsonb,
  structured_ingredients = jsonb_set(
    jsonb_set(
      structured_ingredients,
      '{4,amount}',
      'null'::jsonb
    ),
    '{4,unit}',
    '""'::jsonb
  )
where id = '88b4386b-5ac5-4e9e-8558-e666f23fa38c';
