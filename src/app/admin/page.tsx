"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import TransitionArrow from "@/components/ui/transition-arrow";
import NewRecipeTab from "@/features/admin/new-recipe-tab";
import RecipesTab from "@/features/admin/recipes-tab";
import CategoriesTab from "@/features/admin/categories-tab";
import type { AdminRecipe, AdminTab } from "@/features/admin/types";
import {
  addCategory,
  createAdminRecipe,
  deleteRecipeImage,
  deleteAdminRecipe,
  listCategories,
  listAdminRecipes,
  removeCategory,
  renameCategory,
  uploadRecipeImage,
} from "@/features/admin/data";
import Toast, { type ToastMessage } from "@/components/ui/toast";
import RecipePreview, { previewFromForm, type RecipePreviewData } from "@/features/admin/recipe-preview";
import { useUnsavedChanges } from "@/features/admin/use-unsaved-changes";
import { categories as fallbackCategories } from "@/features/recipes/constants";
import {
  correctedIngredientLines,
  structuredIngredients,
} from "@/features/recipes/ingredients";
import { createClient } from "@/lib/supabase";

const adminTabs = [
  { id: "new", label: "＋ Новий рецепт" },
  { id: "recipes", label: "Усі рецепти" },
  { id: "categories", label: "Категорії" },
] as const;

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tab, setTab] = useState<AdminTab>("new");
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [ingredientsValue, setIngredientsValue] = useState("");
  const [categories, setCategories] = useState<string[]>([...fallbackCategories]);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState<RecipePreviewData | null>(null);
  const guardLink = useUnsavedChanges(dirty);
  const dismissToast = useCallback(() => setToast(null), []);

  function notify(text: string, tone: "success" | "error" = "success", persistent = false) {
    setToast({ id: crypto.randomUUID(), text, tone, persistent });
  }

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) router.replace("/login");
        else { setReady(true); void listCategories().then(items => { if (items.length) setCategories(items); }); }
      });
  }, [router]);

  async function loadRecipes() {
    setListLoading(true);
    try {
      setRecipes(await listAdminRecipes());
    } catch (error) {
      notify(error instanceof Error ? error.message : "Невідома помилка", "error");
    }
    setListLoading(false);
  }

  function openTab(nextTab: AdminTab) {
    setTab(nextTab);
    if (nextTab !== "new") void loadRecipes();
  }

  async function deleteRecipe(id: string) {
    if (!window.confirm("Видалити цей рецепт?")) return;
    try {
      await deleteAdminRecipe(id);
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
      notify("Рецепт видалено");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Невідома помилка", "error");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    notify("Зберігаємо рецепт…", "success", true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const status = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === "draft" ? "draft" as const : "published" as const;
    const ingredients = correctedIngredientLines(form.get("ingredients"));
    if (status === "published" && !ingredients.length) {
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

    let imageUrl = "";
    if (file) {
      try {
        imageUrl = await uploadRecipeImage(user.id, file);
      } catch (error) {
        notify(error instanceof Error ? error.message : "Не вдалося завантажити фото", "error");
        setSaving(false);
        return;
      }
    }

    const title = String(form.get("title") || "").trim();
    const payload = {
      title,
      slug: `${title
        .toLowerCase()
        .trim()
        .replace(/[^a-zа-яіїєґ0-9]+/gi, "-")
        .replace(/(^-|-$)/g, "")}-${crypto.randomUUID().slice(0, 8)}`,
      cooking_time: Number(form.get("cooking_time") || 0),
      servings: Number(form.get("servings") || 0),
      category: String(form.get("category") || ""),
      difficulty: String(form.get("difficulty") || ""),
      description: String(form.get("description") || ""),
      image_url: imageUrl || null,
      is_favorite: form.get("is_favorite") === "on",
      status,
      ingredients,
      structured_ingredients: structuredIngredients(ingredients),
      instructions: String(form.get("instructions") || "")
        .split("\n")
        .map((step) => step.trim())
        .filter(Boolean),
      created_by: user.id,
    };

    try {
      await createAdminRecipe(payload);
      notify(payload.status === "draft" ? "Чернетку збережено" : "Рецепт опубліковано");
      formElement.reset();
      setFile(null);
      setIngredientsValue("");
      setDirty(false);
    } catch (error) {
      if (imageUrl) await deleteRecipeImage(imageUrl).catch(() => undefined);
      notify(error instanceof Error ? error.message : "Невідома помилка", "error");
    }
    setSaving(false);
  }

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF8FC]">
        <p className="animate-pulse text-[#77717D]">Перевіряємо доступ…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8FC] text-[#35313B]">
      <header className="border-b border-[#E5DFE9] bg-[#FFFDFF]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5">
          <Link href="/" className="group inline-flex items-center gap-3 text-[#756A8A]">
            <TransitionArrow back />
            <span>
              <b className="block font-serif text-base leading-5 text-[#35313B] sm:text-xl">MaryTaste</b>
              <small className="hidden text-[11px] text-[#7E7782] sm:block">Повернутися на сайт</small>
            </span>
          </Link>
          <button onClick={logout} className="shrink-0 rounded-full bg-[#EEEAF4] px-4 py-2 text-xs font-bold text-[#756A8A]">Вийти</button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-7 sm:px-5 sm:py-10 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="min-w-0 overflow-hidden lg:overflow-visible">
          <p className="text-xs font-bold uppercase tracking-widest text-[#847D89]">Керування</p>
          <nav className="mt-4 flex max-w-full flex-col gap-2 pb-2 sm:flex-row lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {adminTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => openTab(item.id)}
                className={`w-auto shrink-0 whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm lg:w-full ${tab === item.id ? "bg-[#756A8A] font-semibold text-white" : "hover:bg-[#FFFDFF]"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <section className="min-w-0">
          {tab === "new" && (
            <div onClick={() => undefined}><NewRecipeTab
              file={file}
              ingredientsValue={ingredientsValue}
              categories={categories}
              saving={saving}
              onFileChange={setFile}
              onIngredientsChange={setIngredientsValue}
              onSubmit={submit}
              onDirty={() => setDirty(true)}
              onCancel={guardLink}
              onPreview={(event) => { const form = event.currentTarget.form; if (form) setPreview(previewFromForm(form, file ? URL.createObjectURL(file) : null)); }}
            /></div>
          )}
          {tab === "recipes" && (
            <RecipesTab recipes={recipes} loading={listLoading} onDelete={(id) => void deleteRecipe(id)} />
          )}
          {tab === "categories" && <CategoriesTab recipes={recipes} categories={categories} onAdd={async name => { try { await addCategory(name); setCategories(await listCategories()); notify("Категорію додано"); } catch(e) { notify(e instanceof Error ? e.message : "Помилка", "error"); } }} onRename={async (oldName, name) => { try { await renameCategory(oldName, name); setCategories(await listCategories()); await loadRecipes(); notify("Категорію перейменовано"); } catch(e) { notify(e instanceof Error ? e.message : "Помилка", "error"); } }} onRemove={async name => { try { await removeCategory(name); setCategories(await listCategories()); notify("Категорію видалено"); } catch(e) { notify(e instanceof Error ? e.message : "Помилка", "error"); } }} />}
        </section>
      </div>
      {preview && <RecipePreview data={preview} onClose={() => setPreview(null)} />}
      <Toast toast={toast} onDismiss={dismissToast} />
    </main>
  );
}
