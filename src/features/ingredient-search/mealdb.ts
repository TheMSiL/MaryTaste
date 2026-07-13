import { parseIngredient } from "./ingredient-search";
import type { ExternalMeal, Ingredient } from "./types";

const groupedExternalQueries: Record<string, string[]> = {
  "minced meat": [
    "minced beef",
    "ground beef",
    "minced pork",
    "ground pork",
    "lamb mince",
    "turkey mince",
  ],
};

function externalIngredientName(ingredient: Ingredient) {
  return ingredient.canonicalName;
}

export function externalQueriesForIngredient(ingredient: Ingredient) {
  return (
    groupedExternalQueries[externalIngredientName(ingredient)] || [
      externalIngredientName(ingredient),
    ]
  );
}

async function fetchMealsByIngredient(ingredient: string) {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`,
  );

  if (!response.ok) throw new Error(`TheMealDB error: ${response.status}`);
  const data = (await response.json()) as { meals: ExternalMeal[] | null };
  if (data.meals?.length) return data.meals;

  const nameResponse = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(ingredient)}`,
  );
  if (!nameResponse.ok) {
    throw new Error(`TheMealDB search error: ${nameResponse.status}`);
  }
  const nameData = (await nameResponse.json()) as {
    meals: ExternalMeal[] | null;
  };
  return nameData.meals || [];
}

export async function fetchExternalMeals(input: string) {
  const ingredients = input
    .split(/[,;\n]+/)
    .map(parseIngredient)
    .filter((item): item is Ingredient => item !== null);
  const names = [
    ...new Set(
      ingredients.flatMap(externalQueriesForIngredient).filter(Boolean),
    ),
  ];
  if (!names.length) return [];

  const results = await Promise.allSettled(names.map(fetchMealsByIngredient));
  const ranked = new Map<string, { meal: ExternalMeal; matches: number }>();
  let successfulRequests = 0;

  for (const result of results) {
    if (result.status === "rejected") continue;
    successfulRequests++;
    for (const meal of result.value) {
      const current = ranked.get(meal.idMeal);
      ranked.set(meal.idMeal, {
        meal,
        matches: (current?.matches || 0) + 1,
      });
    }
  }

  if (!successfulRequests) throw new Error("TheMealDB is unavailable");

  return [...ranked.values()]
    .sort(
      (left, right) =>
        right.matches - left.matches ||
        left.meal.strMeal.localeCompare(right.meal.strMeal),
    )
    .slice(0, 4)
    .map(({ meal }) => meal);
}
