"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import CustomSelect from "@/components/ui/custom-select";
import {
  categoryOptions,
  difficultyOptions,
} from "@/features/recipes/constants";
import {
  ingredientLines,
  structuredIngredients,
} from "@/features/recipes/ingredients";
import {
  getAdminRecipe,
  deleteRecipeImage,
  listCategories,
  updateAdminRecipe,
  uploadRecipeImage,
} from "@/features/admin/data";
import type { EditableRecipe } from "@/features/admin/types";
import IngredientComposer from "@/features/ingredient-search/components/ingredient-composer";
import ImageFilePicker from "@/components/ui/image-file-picker";
import Toast, { type ToastMessage } from "@/components/ui/toast";
import RecipePreview, { previewFromForm, type RecipePreviewData } from "@/features/admin/recipe-preview";
import { useUnsavedChanges } from "@/features/admin/use-unsaved-changes";
const listText = (value: unknown) =>
  Array.isArray(value) ? value.join("\n") : String(value || "");

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<EditableRecipe | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [ingredientsValue, setIngredientsValue] = useState("");
  const [categories, setCategories] = useState<string[]>(categoryOptions.map(x => x.value));
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState<RecipePreviewData | null>(null);
  const guardLink = useUnsavedChanges(dirty);
  const dismissToast = useCallback(() => setToast(null), []);
  const notify = (text: string, tone: "success" | "error" = "success", persistent = false) => setToast({ id: crypto.randomUUID(), text, tone, persistent });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      try {
        const loadedRecipe = await getAdminRecipe(id);
        setRecipe(loadedRecipe);
        setIngredientsValue(listText(loadedRecipe.ingredients));
        const items = await listCategories();
        if (items.length) setCategories(items);
      } catch (error) {
        notify(error instanceof Error ? error.message : "Невідома помилка", "error");
      }
    });
  }, [id, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    notify("Зберігаємо зміни…", "success", true);
    const form = new FormData(event.currentTarget);
    const status = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === "draft" ? "draft" as const : "published" as const;
    const ingredients = ingredientLines(form.get("ingredients"));
    if (!ingredients.length) {
      notify("Додайте хоча б один інгредієнт", "error");
      setSaving(false);
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    let imageUrl = recipe?.image_url || null;
    if (file) {
      try {
        imageUrl = await uploadRecipeImage(user.id, file);
      } catch (error) {
        notify(error instanceof Error ? error.message : "Помилка фото", "error");
        setSaving(false);
        return;
      }
    }
    const payload = {
      title: String(form.get("title")),
      description: String(form.get("description")),
      category: String(form.get("category")),
      cooking_time: Number(form.get("cooking_time")),
      servings: Number(form.get("servings")),
      difficulty: String(form.get("difficulty")),
      image_url: imageUrl,
      ingredients,
      structured_ingredients: structuredIngredients(ingredients),
      instructions: String(form.get("instructions"))
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      is_favorite: form.get("is_favorite") === "on",
      status,
      updated_at: new Date().toISOString(),
    };
    try {
      await updateAdminRecipe(id, payload);
      if (file && recipe?.image_url && recipe.image_url !== imageUrl) await deleteRecipeImage(recipe.image_url);
      setDirty(false);
      notify(payload.status === "draft" ? "Чернетку збережено" : "Зміни опубліковано");
      setTimeout(() => router.push("/admin"), 700);
    } catch (error) {
      if (file && imageUrl !== recipe?.image_url) await deleteRecipeImage(imageUrl);
      notify(error instanceof Error ? error.message : "Невідома помилка", "error");
    }
    setSaving(false);
  }

  if (!recipe)
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF8FC]">
        <p className="text-[#77717D]">Завантажуємо рецепт…</p>
      </main>
    );
  return (
    <main className="min-h-screen bg-[#FAF8FC] px-4 py-7 text-[#35313B] sm:px-5 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" onClick={guardLink} className="text-sm font-bold text-[#756A8A]">
          ← До всіх рецептів
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#B58FA3]">
          Редагування
        </p>
        <h1 className="mt-2 break-words font-serif text-3xl sm:text-4xl">
          {recipe.title}
        </h1>
        <form
          onSubmit={submit}
          onChange={() => setDirty(true)}
          className="admin-form mt-6 min-w-0 space-y-5 overflow-visible rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] p-4 sm:mt-8 sm:rounded-3xl sm:p-6 md:p-9"
        >
          <ImageFilePicker
            file={file}
            onChange={setFile}
            label="Нова фотографія"
            hint="Необов’язково · JPEG, PNG або WebP"
            currentUrl={recipe.image_url}
          />
          <label className="block text-sm font-bold">
            Назва
            <input
              required
              name="title"
              defaultValue={recipe.title}
              className="mt-2 w-full rounded-xl border border-[#E5DFE9] px-4 py-3 font-normal"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Час, хв
              <input
                required
                type="number"
                min="1"
                name="cooking_time"
                defaultValue={recipe.cooking_time}
                className="mt-2 w-full rounded-xl border border-[#E5DFE9] px-4 py-3 font-normal"
              />
            </label>
            <label className="text-sm font-bold">
              Порції
              <input
                required
                type="number"
                min="1"
                name="servings"
                defaultValue={recipe.servings}
                className="mt-2 w-full rounded-xl border border-[#E5DFE9] px-4 py-3 font-normal"
              />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <CustomSelect
              name="category"
              label="Категорія"
              options={categories.map(value => ({ value, label: value }))}
              defaultValue={recipe.category}
            />
            <CustomSelect
              name="difficulty"
              label="Складність"
              options={difficultyOptions}
              defaultValue={recipe.difficulty}
            />
          </div>
          <label className="flex items-center justify-between gap-4 rounded-xl bg-[#F6F0F5] p-4 text-sm font-bold">
            Позначити як улюблене
            <input
              type="checkbox"
              name="is_favorite"
              defaultChecked={recipe.is_favorite}
              className="h-5 w-5 shrink-0 accent-[#B58FA3]"
            />
          </label>
          <label className="block text-sm font-bold">
            Опис
            <textarea
              required
              name="description"
              defaultValue={recipe.description}
              rows={3}
              className="mt-2 w-full rounded-xl border border-[#E5DFE9] px-4 py-3 font-normal"
            />
          </label>
          <div>
            <span className="block text-sm font-bold">Інгредієнти</span>
            <input type="hidden" name="ingredients" value={ingredientsValue} />
            <div className="mt-2 rounded-2xl border border-[#E5DFE9] bg-[#FCFAFD] p-3 font-normal">
              <IngredientComposer
                recipeMode
                value={ingredientsValue}
                onChange={setIngredientsValue}
              />
            </div>
          </div>
          <label className="block text-sm font-bold">
            Приготування
            <textarea
              required
              name="instructions"
              defaultValue={listText(recipe.instructions)}
              rows={8}
              className="mt-2 w-full rounded-xl border border-[#E5DFE9] px-4 py-3 font-normal"
            />
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin"
              onClick={guardLink}
              className="px-5 py-3 text-center text-sm font-bold"
            >
              Скасувати
            </Link>
            <button type="button" onClick={event => { const form = event.currentTarget.form; if (form) setPreview(previewFromForm(form, file ? URL.createObjectURL(file) : recipe.image_url)); }} className="rounded-full border border-[#756A8A]/30 px-5 py-3 text-sm font-bold text-[#756A8A]">Передперегляд</button>
            <button type="submit" name="status" value="draft" formNoValidate disabled={saving} className="rounded-full bg-[#EEEAF4] px-5 py-3 text-sm font-bold text-[#756A8A]">Зберегти чернетку</button>
            <button
              type="submit"
              name="status"
              value="published"
              disabled={saving}
              className="rounded-full bg-[#756A8A] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Зберігаємо…" : "Зберегти зміни"}
            </button>
          </div>
        </form>
      </div>
      {preview && <RecipePreview data={preview} onClose={() => setPreview(null)} />}
      <Toast toast={toast} onDismiss={dismissToast} />
    </main>
  );
}
