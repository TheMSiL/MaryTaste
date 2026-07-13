"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
  updateAdminRecipe,
  uploadRecipeImage,
} from "@/features/admin/data";
import type { EditableRecipe } from "@/features/admin/types";
import IngredientComposer from "@/features/ingredient-search/components/ingredient-composer";
import ImageFilePicker from "@/components/ui/image-file-picker";
const listText = (value: unknown) =>
  Array.isArray(value) ? value.join("\n") : String(value || "");

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<EditableRecipe | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [ingredientsValue, setIngredientsValue] = useState("");

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
      } catch (error) {
        setMessage(`Помилка: ${error instanceof Error ? error.message : "невідома помилка"}`);
      }
    });
  }, [id, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const ingredients = ingredientLines(form.get("ingredients"));
    if (!ingredients.length) {
      setMessage("Помилка: додайте хоча б один інгредієнт.");
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
        setMessage(`Помилка фото: ${error instanceof Error ? error.message : "невідома помилка"}`);
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
      updated_at: new Date().toISOString(),
    };
    try {
      await updateAdminRecipe(id, payload);
      setMessage("Зміни збережено!");
      setTimeout(() => router.push("/admin"), 700);
    } catch (error) {
      setMessage(`Помилка: ${error instanceof Error ? error.message : "невідома помилка"}`);
    }
    setSaving(false);
  }

  if (!recipe)
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF8FC]">
        <p className={message ? "text-red-700" : "text-[#77717D]"}>
          {message || "Завантажуємо рецепт…"}
        </p>
      </main>
    );
  return (
    <main className="min-h-screen bg-[#FAF8FC] px-4 py-7 text-[#35313B] sm:px-5 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-sm font-bold text-[#756A8A]">
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
          className="admin-form mt-6 min-w-0 space-y-5 overflow-visible rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] p-4 sm:mt-8 sm:rounded-3xl sm:p-6 md:p-9"
        >
          <ImageFilePicker
            file={file}
            onChange={setFile}
            label="Нова фотографія"
            hint="Необов’язково · JPEG, PNG або WebP"
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
              options={categoryOptions}
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
          {message && (
            <p
              className={`rounded-xl p-4 text-sm ${message.startsWith("Помилка") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
            >
              {message}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin"
              className="px-5 py-3 text-center text-sm font-bold"
            >
              Скасувати
            </Link>
            <button
              disabled={saving}
              className="rounded-full bg-[#756A8A] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Зберігаємо…" : "Зберегти зміни"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
