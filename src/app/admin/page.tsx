"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import CustomSelect from "@/components/ui/custom-select";
import {
  categories,
  categoryOptions,
  difficultyOptions,
} from "@/features/recipes/constants";
import {
  ingredientLines,
  missingStructuredIngredientsColumn,
  structuredIngredients,
} from "@/features/recipes/ingredients";
import IngredientComposer from "@/features/ingredient-search/components/ingredient-composer";
import ImageFilePicker from "@/components/ui/image-file-picker";
import TransitionArrow from "@/components/ui/transition-arrow";
type Tab = "new" | "recipes" | "categories";
type AdminRecipe = {
  id: string;
  title: string;
  category: string;
  cooking_time: number;
  is_favorite: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Tab>("new");
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [ingredientsValue, setIngredientsValue] = useState("");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) router.replace("/login");
        else setReady(true);
      });
  }, [router]);

  async function loadRecipes() {
    setListLoading(true);
    const supabase = createClient();
    const primary = await supabase
      .from("recipes")
      .select("id,title,category,cooking_time,is_favorite")
      .order("created_at", { ascending: false });
    if (primary.error?.message.includes("is_favorite")) {
      const fallback = await supabase
        .from("recipes")
        .select("id,title,category,cooking_time")
        .order("created_at", { ascending: false });
      if (fallback.error) setMessage(`Помилка: ${fallback.error.message}`);
      else {
        setRecipes(
          (fallback.data || []).map((recipe) => ({
            ...recipe,
            is_favorite: false,
          })),
        );
        setMessage("");
      }
    } else if (primary.error) setMessage(`Помилка: ${primary.error.message}`);
    else {
      setRecipes(primary.data || []);
      setMessage("");
    }
    setListLoading(false);
  }

  function openTab(nextTab: Tab) {
    setTab(nextTab);
    setMessage("");
    if (nextTab !== "new") void loadRecipes();
  }

  async function deleteRecipe(id: string) {
    if (!window.confirm("Видалити цей рецепт?")) return;
    const { error } = await createClient()
      .from("recipes")
      .delete()
      .eq("id", id);
    if (error) setMessage(`Помилка: ${error.message}`);
    else setRecipes((current) => current.filter((recipe) => recipe.id !== id));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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
    let imageUrl = "";
    if (file) {
      const extension = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(path, file);
      if (uploadError) {
        setMessage(`Помилка фото: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      imageUrl = supabase.storage.from("recipe-images").getPublicUrl(path)
        .data.publicUrl;
    }
    const title = String(form.get("title"));
    const payload = {
      title,
      slug: `${title
        .toLowerCase()
        .trim()
        .replace(/[^a-zа-яіїєґ0-9]+/gi, "-")
        .replace(/(^-|-$)/g, "")}-${Date.now()}`,
      cooking_time: Number(form.get("cooking_time")),
      servings: Number(form.get("servings")),
      category: String(form.get("category")),
      difficulty: String(form.get("difficulty")),
      description: String(form.get("description")),
      image_url: imageUrl || null,
      is_favorite: form.get("is_favorite") === "on",
      ingredients,
      structured_ingredients: structuredIngredients(ingredients),
      instructions: String(form.get("instructions"))
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      created_by: user.id,
    };
    let { error } = await supabase.from("recipes").insert(payload);
    if (error && missingStructuredIngredientsColumn(error.message)) {
      const { structured_ingredients: _, ...legacyPayload } = payload;
      void _;
      ({ error } = await supabase.from("recipes").insert(legacyPayload));
    }
    setSaving(false);
    if (error) setMessage(`Помилка: ${error.message}`);
    else {
      setMessage("Рецепт успішно опубліковано!");
      formElement.reset();
      setFile(null);
      setIngredientsValue("");
    }
  }

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  if (!ready)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f5ee]">
        <p className="animate-pulse text-[#716b61]">Перевіряємо доступ…</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-[#f8f5ee] text-[#28251f]">
      <header className="border-b border-[#ded8ca] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-[#315c42]"
          >
            <TransitionArrow back />
            <span>
              <b className="block font-serif text-base leading-5 text-[#28251f] sm:text-xl">
                MaryTaste
              </b>
              <small className="hidden text-[11px] text-[#80796e] sm:block">
                Повернутися на сайт
              </small>
            </span>
          </Link>
          <button
            onClick={logout}
            className="shrink-0 rounded-full bg-[#e7f0e9] px-4 py-2 text-xs font-bold text-[#315c42]"
          >
            Вийти
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-7 sm:px-5 sm:py-10 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="min-w-0 overflow-hidden lg:overflow-visible">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8a8275]">
            Керування
          </p>
          <nav className="mt-4 flex sm:flex-row flex-col max-w-full gap-2 pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {(
              [
                { id: "new", label: "＋ Новий рецепт" },
                { id: "recipes", label: "Усі рецепти" },
                { id: "categories", label: "Категорії" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => openTab(item.id)}
                className={`w-auto shrink-0 whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm lg:w-full ${tab === item.id ? "bg-[#315c42] font-semibold text-white" : "hover:bg-white"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <section className="min-w-0">
          {tab === "new" ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b55d3a]">
                Новий запис
              </p>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
                Додати рецепт
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#716b61] sm:text-base">
                Заповніть картку — рецепт з’явиться в загальній колекції.
              </p>
              <form
                onSubmit={submit}
                className="admin-form mt-6 min-w-0 space-y-6 overflow-visible rounded-2xl border border-[#ded8ca] bg-white p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6 md:p-9"
              >
                <ImageFilePicker file={file} onChange={setFile} />
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Назва рецепта
                  </span>
                  <input
                    required
                    name="title"
                    className="w-full rounded-xl border border-[#d8d1c3] px-4 py-3 outline-none focus:border-[#315c42]"
                    placeholder="Наприклад, вишневий пиріг"
                  />
                </label>
                <div className="grid gap-5 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-bold">
                      Час приготування, хв
                    </span>
                    <input
                      required
                      min="1"
                      type="number"
                      name="cooking_time"
                      className="w-full rounded-xl border border-[#d8d1c3] px-4 py-3"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold">
                      Кількість порцій
                    </span>
                    <input
                      required
                      min="1"
                      type="number"
                      name="servings"
                      defaultValue="4"
                      className="w-full rounded-xl border border-[#d8d1c3] px-4 py-3"
                    />
                  </label>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <CustomSelect
                    required
                    name="category"
                    label="Категорія"
                    options={categoryOptions}
                    placeholder="Виберіть категорію"
                  />
                  <CustomSelect
                    name="difficulty"
                    label="Складність"
                    options={difficultyOptions}
                    defaultValue="Легко"
                  />
                </div>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#e0d6c5] bg-[#faf6ed] p-4">
                  <span className="min-w-0">
                    <b className="block text-sm">Позначити як улюблене</b>
                    <small className="mt-1 block text-[#80796e]">
                      На картці з’явиться помаранчева плашка «Улюблене»
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    name="is_favorite"
                    className="h-5 w-5 shrink-0 accent-[#b55d3a]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Короткий опис
                  </span>
                  <textarea
                    required
                    name="description"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-[#d8d1c3] px-4 py-3"
                    placeholder="Кілька слів про страву..."
                  />
                </label>
                <div className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Інгредієнти{" "}
                    <small className="font-normal text-[#8a8275]">
                      — оберіть продукт і вкажіть кількість
                    </small>
                  </span>
                  <input
                    type="hidden"
                    name="ingredients"
                    value={ingredientsValue}
                  />
                  <div className="rounded-2xl border border-[#d8d1c3] bg-[#faf8f3] p-3">
                    <IngredientComposer
                      recipeMode
                      value={ingredientsValue}
                      onChange={setIngredientsValue}
                    />
                  </div>
                  {!ingredientsValue && (
                    <p className="mt-2 text-xs text-[#8a8275]">
                      Додайте щонайменше один інгредієнт.
                    </p>
                  )}
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Приготування{" "}
                    <small className="font-normal text-[#8a8275]">
                      — кожен крок з нового рядка
                    </small>
                  </span>
                  <textarea
                    required
                    name="instructions"
                    rows={7}
                    className="w-full resize-none rounded-xl border border-[#d8d1c3] px-4 py-3"
                    placeholder="Підготуйте інгредієнти…"
                  />
                </label>
                {message && (
                  <p
                    className={`rounded-xl p-4 text-sm ${message.startsWith("Помилка") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                  >
                    {message}
                  </p>
                )}
                <div className="flex flex-col-reverse gap-3 border-t border-[#eee9df] pt-6 sm:flex-row sm:justify-end">
                  <Link
                    href="/"
                    className="rounded-full px-5 py-3 text-center text-sm font-bold"
                  >
                    Скасувати
                  </Link>
                  <button
                    disabled={saving}
                    className="rounded-full bg-[#315c42] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {saving ? "Зберігаємо…" : "Опублікувати рецепт"}
                  </button>
                </div>
              </form>
            </>
          ) : tab === "recipes" ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b55d3a]">
                Колекція
              </p>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
                Усі рецепти
              </h1>
              <p className="mt-3 text-[#716b61]">
                Переглядайте, редагуйте та видаляйте опубліковані рецепти.
              </p>
              {message && (
                <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {message}
                </p>
              )}
              <div className="mt-8 overflow-hidden rounded-3xl border border-[#ded8ca] bg-white">
                {listLoading ? (
                  <p className="p-8 text-[#716b61]">Завантажуємо…</p>
                ) : recipes.length ? (
                  recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex flex-col gap-4 border-b border-[#eee9df] p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="wrap-break-word font-serif text-lg">
                            {recipe.title}
                          </h2>
                          {recipe.is_favorite && (
                            <span className="rounded-full bg-[#b55d3a] px-2 py-1 text-[10px] font-bold text-white">
                              Улюблене
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#80796e]">
                          {recipe.category} · {recipe.cooking_time} хв
                        </p>
                      </div>
                      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0">
                        <Link
                          href={`/admin/edit/${recipe.id}`}
                          className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#315c42]/30 px-3 py-2 text-center text-sm font-semibold text-[#315c42] transition-colors duration-300 hover:bg-[#e7f0e9] sm:px-4 sm:text-sm"
                        >
                          Редагувати
                        </Link>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="min-h-10 rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors duration-300 hover:bg-red-50 sm:px-4 sm:text-sm"
                        >
                          Видалити
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-8 text-[#716b61]">Рецептів поки немає.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b55d3a]">
                Огляд
              </p>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
                Категорії
              </h1>
              <p className="mt-3 text-[#716b61]">
                Кількість рецептів у кожному розділі.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="rounded-2xl border border-[#ded8ca] bg-white p-5"
                  >
                    <p className="font-serif text-xl">{category}</p>
                    <p className="mt-2 text-sm text-[#80796e]">
                      {
                        recipes.filter((recipe) => recipe.category === category)
                          .length
                      }{" "}
                      рецептів
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
