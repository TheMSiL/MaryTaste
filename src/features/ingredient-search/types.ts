export type Recipe = {
  id: string;
  title: string;
  description: string;
  servings: number;
  image_url: string | null;
  ingredients: unknown;
  structured_ingredients?: unknown;
};

export type Ingredient = {
  name: string;
  canonicalName: string;
  recognized: boolean;
  amount: number | null;
  unit: string;
};

export type Match = {
  recipe: Recipe;
  portions: number;
  ratio: number;
  found: number;
  total: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  unknownQuantityIngredients: string[];
  limiting?: { name: string; have: number; need: number; unit: string };
};

export type ExternalMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};
