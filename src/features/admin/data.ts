import { createClient } from "@/lib/supabase";
import { missingStructuredIngredientsColumn } from "@/features/recipes/ingredients";
import type { AdminRecipe, EditableRecipe, RecipeWritePayload } from "./types";

function requireSuccess(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function listAdminRecipes(): Promise<AdminRecipe[]> {
  const supabase = createClient();
  const primary = await supabase
    .from("recipes")
    .select("id,title,category,cooking_time,is_favorite")
    .order("created_at", { ascending: false });

  if (!primary.error) return primary.data || [];
  if (!primary.error.message.includes("is_favorite")) {
    throw new Error(primary.error.message);
  }

  const fallback = await supabase
    .from("recipes")
    .select("id,title,category,cooking_time")
    .order("created_at", { ascending: false });
  requireSuccess(fallback.error);
  return (fallback.data || []).map((recipe) => ({
    ...recipe,
    is_favorite: false,
  }));
}

export async function getAdminRecipe(id: string): Promise<EditableRecipe> {
  const supabase = createClient();
  let result = await supabase
    .from("recipes")
    .select(
      "title,description,category,cooking_time,servings,difficulty,image_url,ingredients,instructions,is_favorite",
    )
    .eq("id", id)
    .single();

  if (result.error?.message.includes("is_favorite")) {
    result = (await supabase
      .from("recipes")
      .select(
        "title,description,category,cooking_time,servings,difficulty,image_url,ingredients,instructions",
      )
      .eq("id", id)
      .single()) as typeof result;
  }
  requireSuccess(result.error);
  if (!result.data) throw new Error("Рецепт не знайдено");
  return result.data;
}

export async function uploadRecipeImage(userId: string, file: File) {
  const supabase = createClient();
  const extension = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from("recipe-images").upload(path, file);
  requireSuccess(upload.error);
  return supabase.storage.from("recipe-images").getPublicUrl(path).data.publicUrl;
}

export async function createAdminRecipe(payload: RecipeWritePayload) {
  const supabase = createClient();
  let { error } = await supabase.from("recipes").insert(payload);
  if (error && missingStructuredIngredientsColumn(error.message)) {
    const { structured_ingredients: omitted, ...legacyPayload } = payload;
    void omitted;
    ({ error } = await supabase.from("recipes").insert(legacyPayload));
  }
  requireSuccess(error);
}

export async function updateAdminRecipe(id: string, payload: RecipeWritePayload) {
  const supabase = createClient();
  let { error } = await supabase.from("recipes").update(payload).eq("id", id);
  if (error && missingStructuredIngredientsColumn(error.message)) {
    const { structured_ingredients: omitted, ...legacyPayload } = payload;
    void omitted;
    ({ error } = await supabase.from("recipes").update(legacyPayload).eq("id", id));
  }
  requireSuccess(error);
}

export async function deleteAdminRecipe(id: string) {
  const { error } = await createClient().from("recipes").delete().eq("id", id);
  requireSuccess(error);
}
