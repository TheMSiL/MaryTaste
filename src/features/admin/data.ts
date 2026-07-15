import { createClient } from "@/lib/supabase";
import { missingStructuredIngredientsColumn } from "@/features/recipes/ingredients";
import type { AdminRecipe, EditableRecipe, RecipeWritePayload } from "./types";
import { ukrainianIngredientName } from "@/features/ingredient-search/ingredient-catalog";

function requireSuccess(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function listAdminRecipes(): Promise<AdminRecipe[]> {
  const supabase = createClient();
  const primary = await supabase
    .from("recipes")
    .select("id,title,category,cooking_time,is_favorite,status")
    .order("created_at", { ascending: false });

  if (!primary.error) return (primary.data || []) as AdminRecipe[];
  if (!primary.error.message.includes("is_favorite") && !primary.error.message.includes("status")) {
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
    status: "published" as const,
  }));
}

export async function getAdminRecipe(id: string): Promise<EditableRecipe> {
  const supabase = createClient();
  let result = await supabase
    .from("recipes")
    .select(
      "title,description,category,cooking_time,servings,difficulty,image_url,ingredients,instructions,is_favorite,status",
    )
    .eq("id", id)
    .single();

  if (result.error?.message.includes("is_favorite") || result.error?.message.includes("status")) {
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
  return { ...result.data, status: result.data.status || "published" };
}

export async function uploadRecipeImage(userId: string, file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error("Дозволені лише JPEG, PNG або WebP");
  if (file.size > 8 * 1024 * 1024) throw new Error("Файл має бути меншим за 8 МБ");
  const supabase = createClient();
  const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[file.type];
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from("recipe-images").upload(path, file);
  requireSuccess(upload.error);
  return supabase.storage.from("recipe-images").getPublicUrl(path).data.publicUrl;
}

function storagePath(publicUrl: string | null) {
  if (!publicUrl) return null;
  const marker = "/storage/v1/object/public/recipe-images/";
  const index = publicUrl.indexOf(marker);
  return index < 0 ? null : decodeURIComponent(publicUrl.slice(index + marker.length));
}

export async function deleteRecipeImage(publicUrl: string | null) {
  const path = storagePath(publicUrl);
  if (!path) return;
  const { error } = await createClient().storage.from("recipe-images").remove([path]);
  requireSuccess(error);
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
  await syncIngredientCatalog(payload.structured_ingredients);
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
  await syncIngredientCatalog(payload.structured_ingredients);
}

async function syncIngredientCatalog(
  ingredients: RecipeWritePayload["structured_ingredients"],
) {
  const names = [...new Set(ingredients.map((item) => ukrainianIngredientName(item.name)).filter(Boolean))];
  if (!names.length) return;
  const { error } = await createClient()
    .from("ingredient_catalog")
    .upsert(names.map((name) => ({ name })), { onConflict: "name" });
  // Older installations may not have run the catalog migration yet.
  if (error && !error.message.includes("ingredient_catalog")) requireSuccess(error);
}

export async function deleteAdminRecipe(id: string) {
  const client = createClient();
  const existing = await client.from("recipes").select("image_url").eq("id", id).single();
  const { error } = await client.from("recipes").delete().eq("id", id);
  requireSuccess(error);
  await deleteRecipeImage(existing.data?.image_url || null);
}

export async function listCategories(): Promise<string[]> {
  const result = await createClient().from("recipe_categories").select("name").order("name");
  if (result.error) return [];
  return (result.data || []).map((item) => item.name);
}

export async function addCategory(name: string) {
  const value = name.trim();
  if (!value) throw new Error("Вкажіть назву категорії");
  const { error } = await createClient().from("recipe_categories").insert({ name: value });
  requireSuccess(error);
}

export async function renameCategory(oldName: string, name: string) {
  const value = name.trim();
  if (!value) throw new Error("Вкажіть назву категорії");
  const client = createClient();
  const category = await client.from("recipe_categories").update({ name: value }).eq("name", oldName);
  requireSuccess(category.error);
  const recipes = await client.from("recipes").update({ category: value }).eq("category", oldName);
  requireSuccess(recipes.error);
}

export async function removeCategory(name: string) {
  const used = await createClient().from("recipes").select("id", { count: "exact", head: true }).eq("category", name);
  requireSuccess(used.error);
  if (used.count) throw new Error("Спочатку перенесіть рецепти з цієї категорії");
  const { error } = await createClient().from("recipe_categories").delete().eq("name", name);
  requireSuccess(error);
}
