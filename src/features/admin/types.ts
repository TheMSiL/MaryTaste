export type AdminTab = "new" | "recipes" | "categories";

export type AdminRecipe = {
  id: string;
  title: string;
  category: string;
  cooking_time: number;
  is_favorite: boolean;
  status: "draft" | "published";
};

export type EditableRecipe = {
  title: string;
  description: string;
  category: string;
  cooking_time: number;
  servings: number;
  difficulty: string;
  image_url: string | null;
  ingredients: unknown;
  instructions: unknown;
  is_favorite?: boolean;
  status?: "draft" | "published";
};

export type RecipeWritePayload = {
  title: string;
  description: string;
  category: string;
  cooking_time: number;
  servings: number;
  difficulty: string;
  image_url: string | null;
  is_favorite: boolean;
  status: "draft" | "published";
  ingredients: string[];
  structured_ingredients: ReturnType<
    typeof import("@/features/recipes/ingredients").structuredIngredients
  >;
  instructions: string[];
  slug?: string;
  created_by?: string;
  updated_at?: string;
};
