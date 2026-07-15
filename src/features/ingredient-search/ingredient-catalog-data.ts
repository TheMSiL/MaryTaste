import { createClient } from "@/lib/supabase";

export async function listIngredientCatalog(): Promise<string[]> {
  const { data, error } = await createClient()
    .from("ingredient_catalog")
    .select("name")
    .order("name");
  if (error) return [];
  return (data || []).map((item) => item.name);
}
