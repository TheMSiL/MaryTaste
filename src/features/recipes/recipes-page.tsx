"use client";

// Public recipe collection page.

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import MobileMenu from "@/app/components/mobile-menu";
import TransitionArrow from "@/components/ui/transition-arrow";
import BrandMark from "@/components/brand-mark";
import Toast, { type ToastMessage } from "@/components/ui/toast";
import FavoritesLink from "@/components/favorites-link";

const categories = [
  "Усі рецепти",
  "Сніданки",
  "Супи",
  "Основні страви",
  "Випічка",
  "Десерти",
  "Напої",
];

type Recipe = {
  id: string | number;
  title: string;
  category: string;
  time: string;
  difficulty: string;
  image: string;
  description: string;
  ingredientsText: string;
  isFavorite?: boolean;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=85";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [active, setActive] = useState("Усі рецепти");
  const [query, setQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const urlReadyRef = useRef(false);
  const filtered = useMemo(
    () =>
      recipes.filter(
        (recipe) =>
          (active === "Усі рецепти" || recipe.category === active) &&
          (recipe.title + recipe.description + recipe.ingredientsText)
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [active, query, recipes],
  );
  const visibleRecipes = filtered.slice(0, visibleCount);
  const dismissToast = useCallback(() => setToast(null), []);

  function selectCategory(category: string) {
    setActive(category);
    setVisibleCount(6);
    setCategoryOpen(false);
  }

  async function copyFilteredCatalogLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({
        id: Date.now(),
        text: "Посилання на добірку скопійовано",
        tone: "success",
      });
    } catch {
      setToast({
        id: Date.now(),
        text: "Не вдалося скопіювати посилання",
        tone: "error",
      });
    }
  }

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= filtered.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + 6, filtered.length));
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    const initialCategory = params.get("category") || "Усі рецепти";
    queueMicrotask(() => {
      if (initialQuery) setQuery(initialQuery);
      if (categories.includes(initialCategory)) setActive(initialCategory);
      urlReadyRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!urlReadyRef.current) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (active !== "Усі рецепти") params.set("category", active);
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : "/recipes");
  }, [active, query]);

  useEffect(() => {
    const supabase = createClient();
    async function loadRecipes() {
      const primary = await supabase
        .from("recipes")
        .select(
          "id,title,description,category,cooking_time,difficulty,image_url,is_favorite,ingredients",
        )
        .order("created_at", { ascending: false });
      let data: Array<{
        id: string;
        title: string;
        description: string;
        category: string;
        cooking_time: number;
        difficulty: string;
        image_url: string | null;
        is_favorite?: boolean;
        ingredients?: unknown;
      }> | null = primary.data;
      let error = primary.error;
      let favoriteSupported = true;
      if (error?.message.includes("is_favorite")) {
        favoriteSupported = false;
        const fallback = await supabase
          .from("recipes")
          .select(
            "id,title,description,category,cooking_time,difficulty,image_url,ingredients",
          )
          .order("created_at", { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }
      if (error)
        setLoadError(`Не вдалося завантажити рецепти: ${error.message}`);
      else
        setRecipes(
          (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            time: `${item.cooking_time} хв`,
            difficulty: item.difficulty,
            image: item.image_url || fallbackImage,
            isFavorite: favoriteSupported && Boolean(item.is_favorite),
            ingredientsText: Array.isArray(item.ingredients)
              ? item.ingredients.join(" ")
              : String(item.ingredients || ""),
          })),
        );
      setLoading(false);
    }
    void loadRecipes();
  }, []);

  useEffect(() => {
    function closeCategoryMenu(event: PointerEvent) {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setCategoryOpen(false);
    }

    document.addEventListener("pointerdown", closeCategoryMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeCategoryMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF8FC] text-[#35313B]">
      <header className="border-b border-[#E5DFE9] bg-[#FAF8FC]/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-360 items-center justify-between px-4 py-4 sm:px-5 sm:py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <span>
              <b className="block font-serif text-xl leading-5">MaryTaste</b>
              <small className="text-[#7E7782]">Готуємо з любов’ю</small>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <FavoritesLink />
            <MobileMenu />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-360 px-5 pb-8 pt-12 lg:px-10 lg:pt-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.25em] text-[#B58FA3]">
            Домашня колекція
          </p>
          <h1 className="font-serif text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-7xl">
            Що приготуємо
            <br />
            <i className="font-normal text-[#756A8A]">сьогодні?</i>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#77717D]">
            Перевірені рецепти для теплих сніданків, сімейних вечерь та
            особливих вечорів.
          </p>
        </div>
        <div className="relative mt-9 max-w-2xl">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(6);
            }}
            placeholder="Знайти рецепт або інгредієнт..."
            className="w-full rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] py-4 pl-14 pr-5 shadow-sm outline-none transition focus:border-[#756A8A] focus:ring-4 focus:ring-[#756A8A]/10"
          />
        </div>
      </section>

      <div className="mx-auto grid max-w-360 gap-7 px-4 pb-14 sm:px-5 lg:grid-cols-[230px_1fr] lg:gap-9 lg:px-10 lg:pb-20">
        <aside className="min-w-0 lg:overflow-visible">
          <p className="mb-4 hidden text-xs font-bold uppercase tracking-[.18em] text-[#847D89] lg:block">
            Категорії
          </p>
          <div ref={categoryMenuRef} className="relative lg:hidden">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.18em] text-[#847D89]">
              Фільтр за категорією
            </span>
            <button
              type="button"
              aria-expanded={categoryOpen}
              aria-controls="mobile-category-menu"
              onClick={() => setCategoryOpen((current) => !current)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border bg-[#FFFDFF] px-4 text-left shadow-[0_6px_20px_rgba(70,60,40,.06)] transition ${categoryOpen ? "border-[#756A8A] ring-4 ring-[#756A8A]/10" : "border-[#E5DFE9]"}`}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#EEEAF4] text-[#756A8A]"
                aria-hidden="true"
              >
                ◇
              </span>
              <span className="min-w-0 flex-1 font-serif text-lg">
                {active}
              </span>
              <span
                className={`text-xs text-[#756A8A] transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>
            {categoryOpen && (
              <div
                id="mobile-category-menu"
                role="listbox"
                aria-label="Категорії рецептів"
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-72 overflow-y-auto rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] p-2 shadow-[0_18px_45px_rgba(40,37,31,.16)]"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    role="option"
                    aria-selected={active === category}
                    onClick={() => {
                      selectCategory(category);
                    }}
                    className={`flex min-h-11 w-full items-center justify-between rounded-xl px-4 text-left text-sm transition ${active === category ? "bg-[#756A8A] font-semibold text-white" : "text-[#504A55] hover:bg-[#F3EFF6]"}`}
                  >
                    {category}
                    {active === category && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hidden max-w-full gap-2 lg:flex lg:flex-col lg:overflow-visible">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm font-medium transition ${active === category ? "bg-[#756A8A] text-white shadow-md" : "hover:bg-[#FFFDFF]"}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="mt-10 hidden rounded-2xl bg-[#F0EBF3] p-5 lg:block">
            <span className="text-2xl">☼</span>
            <p className="mt-3 font-serif text-lg">Сімейна кухня</p>
            <p className="mt-1 text-sm leading-6 text-[#77717D]">
              Зберігаємо улюблені смаки та історії.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm text-[#847D89]">
                Знайдено: {filtered.length}
              </p>
              <h2 className="mt-1 font-serif text-3xl">{active}</h2>
            </div>
            <button
              type="button"
              onClick={() => void copyFilteredCatalogLink()}
              className="rounded-full border border-[#756A8A]/25 bg-[#FFFDFF] px-4 py-2 text-xs font-bold text-[#756A8A] transition hover:border-[#756A8A] hover:bg-[#EEEAF4]"
            >
              Поділитися
            </button>
          </div>
          {loadError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {loadError}
            </div>
          )}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-107.5 animate-pulse rounded-[22px] bg-[#FFFDFF]"
                />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibleRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="group overflow-hidden rounded-[22px] border border-[#E5DFE9] bg-[#FFFDFF] shadow-[0_8px_30px_rgba(70,60,40,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      loading="eager"
                      fill
                      unoptimized={recipe.image.includes("supabase.co")}
                      sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-[#FAF8FC]/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                      {recipe.category}
                    </span>
                    {recipe.isFavorite && (
                      <span className="absolute right-4 top-4 rounded-full bg-[#B58FA3] px-3 py-1.5 text-xs font-bold text-white">
                        Улюблене
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex gap-4 text-xs font-medium text-[#7E7782]">
                      <span>◷ {recipe.time}</span>
                      <span>◇ {recipe.difficulty}</span>
                    </div>
                    <h3 className="font-serif text-2xl leading-tight">
                      {recipe.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#77717D]">
                      {recipe.description}
                    </p>
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#756A8A]"
                    >
                      Переглянути рецепт
                      <TransitionArrow />
                    </Link>
                  </div>
                </article>
              ))}
              {visibleCount < filtered.length && (
                <div
                  ref={loadMoreRef}
                  className="col-span-full flex h-12 items-center justify-center text-xs text-[#847D89]"
                >
                  Завантажуємо ще рецепти…
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#DDD6E2] py-20 text-center">
              <div className="text-4xl">⌕</div>
              <h3 className="mt-4 font-serif text-2xl">Нічого не знайдено</h3>
              <p className="mt-2 text-[#77717D]">
                Спробуйте змінити запит або вибрати іншу категорію.
              </p>
            </div>
          )}
        </section>
      </div>
      <Toast toast={toast} onDismiss={dismissToast} />
    </main>
  );
}
