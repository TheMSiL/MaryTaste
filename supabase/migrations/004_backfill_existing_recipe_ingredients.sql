update public.recipes
set
  ingredients = '["Борошно 700 г","Оливкова олія 4 ст. л.","Кип’яток 400 мл","Сіль 1 ч. л.","Фарш 600 г","Цибуля 3 шт","Перець за смаком","Вода 100 мл"]'::jsonb,
  structured_ingredients = '[
    {"name":"Борошно","canonicalName":"flour","amount":700,"unit":"г","recognized":true},
    {"name":"Оливкова олія","canonicalName":"olive oil","amount":4,"unit":"ст. л.","recognized":true},
    {"name":"Кип’яток","canonicalName":"water","amount":400,"unit":"мл","recognized":true},
    {"name":"Сіль","canonicalName":"salt","amount":1,"unit":"ч. л.","recognized":true},
    {"name":"Фарш","canonicalName":"minced meat","amount":600,"unit":"г","recognized":true},
    {"name":"Цибуля","canonicalName":"onion","amount":3,"unit":"шт","recognized":true},
    {"name":"Перець","canonicalName":"pepper","amount":null,"unit":"","recognized":true},
    {"name":"Вода","canonicalName":"water","amount":100,"unit":"мл","recognized":true}
  ]'::jsonb
where id = '1a5c6847-a046-4a0a-a126-6e891706099f';

update public.recipes
set
  ingredients = '["Картопля 550 г","Грудинка 200 г","Твердий сир 180 г","Цибуля 100 г","Часник 2 зубч.","Вершки 300 г","Спеції за смаком"]'::jsonb,
  structured_ingredients = '[
    {"name":"Картопля","canonicalName":"potato","amount":550,"unit":"г","recognized":true},
    {"name":"Грудинка","canonicalName":"brisket","amount":200,"unit":"г","recognized":true},
    {"name":"Твердий сир","canonicalName":"cheese","amount":180,"unit":"г","recognized":true},
    {"name":"Цибуля","canonicalName":"onion","amount":100,"unit":"г","recognized":true},
    {"name":"Часник","canonicalName":"garlic","amount":2,"unit":"зубч.","recognized":true},
    {"name":"Вершки","canonicalName":"cream","amount":300,"unit":"г","recognized":true},
    {"name":"Спеції","canonicalName":"spices","amount":null,"unit":"","recognized":false}
  ]'::jsonb
where id = '88b4386b-5ac5-4e9e-8558-e666f23fa38c';

update public.recipes
set
  ingredients = '["Борошно 200 г","Масло вершкове 100 г","Сіль 1 ч. л.","Яйця курячі 5 шт","Лосось 350 г","Броколі 300 г","Вершки 200 мл","Спеції за смаком"]'::jsonb,
  structured_ingredients = '[
    {"name":"Борошно","canonicalName":"flour","amount":200,"unit":"г","recognized":true},
    {"name":"Масло вершкове","canonicalName":"butter","amount":100,"unit":"г","recognized":true},
    {"name":"Сіль","canonicalName":"salt","amount":1,"unit":"ч. л.","recognized":true},
    {"name":"Яйця курячі","canonicalName":"egg","amount":5,"unit":"шт","recognized":true},
    {"name":"Лосось","canonicalName":"salmon","amount":350,"unit":"г","recognized":true},
    {"name":"Броколі","canonicalName":"broccoli","amount":300,"unit":"г","recognized":true},
    {"name":"Вершки","canonicalName":"cream","amount":200,"unit":"мл","recognized":true},
    {"name":"Спеції","canonicalName":"spices","amount":null,"unit":"","recognized":false}
  ]'::jsonb
where id = '6d18aff9-0b66-41b2-963c-57151d641120';
