"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import FavoritesLink, {
  favoritesChangedEvent,
  favoritesKey,
  readFavoriteIds,
} from "@/components/favorites-link";
import BrandMark from "@/components/brand-mark";
import MobileMenu from "@/app/components/mobile-menu";
import { createClient } from "@/lib/supabase";

type FavoriteRecipe = {
  id: string;
  title: string;
  description: string;
  category: string;
  cooking_time: number;
  difficulty: string;
  image_url: string | null;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=85";

export default function FavoritesPage() {
  const [recipes, setRecipes] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ids = readFavoriteIds();
    if (!ids.length) {
      setLoading(false);
      return;
    }

    createClient()
      .from("recipes")
      .select("id,title,description,category,cooking_time,difficulty,image_url")
      .in("id", ids)
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        else {
          const byId = new Map(
            ((data || []) as FavoriteRecipe[]).map((recipe) => [
              String(recipe.id),
              recipe,
            ]),
          );
          setRecipes(ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])));
        }
        setLoading(false);
      });
  }, []);

  function removeFavorite(recipeId: string) {
    const ids = readFavoriteIds().filter((id) => id !== recipeId);
    localStorage.setItem(favoritesKey, JSON.stringify(ids));
    setRecipes((current) => current.filter((recipe) => String(recipe.id) !== recipeId));
    window.dispatchEvent(new Event(favoritesChangedEvent));
  }

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

      <section className="mx-auto max-w-360 px-5 py-12 lg:px-10 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#B58FA3]">
          Ваша колекція
        </p>
        <h1 className="mt-3 font-serif text-5xl">Обрані рецепти</h1>
        <p className="mt-4 text-[#77717D]">
          Рецепти зберігаються на цьому пристрої.
        </p>

        {error && (
          <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Не вдалося завантажити рецепти: {error}
          </p>
        )}
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-96 animate-pulse rounded-3xl bg-white" />
            ))}
          </div>
        ) : recipes.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <article
                key={recipe.id}
                className="group overflow-hidden rounded-3xl border border-[#E5DFE9] bg-[#FFFDFF] shadow-[0_8px_30px_rgba(70,60,40,.06)]"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={recipe.image_url || fallbackImage}
                    alt={recipe.title}
                    fill
                    unoptimized={Boolean(recipe.image_url?.includes("supabase.co"))}
                    sizes="(max-width: 639px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => removeFavorite(String(recipe.id))}
                    aria-label={`Прибрати ${recipe.title} з обраного`}
                    className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[#FFFDFF]/90 text-xl text-[#B58FA3] shadow backdrop-blur"
                  >
                    ♥
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B58FA3]">
                    {recipe.category}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl">{recipe.title}</h2>
                  <p className="mt-3 line-clamp-2 leading-6 text-[#77717D]">
                    {recipe.description}
                  </p>
                  <div className="mt-4 flex gap-4 text-xs text-[#847D89]">
                    <span>◷ {recipe.cooking_time} хв</span>
                    <span>◇ {recipe.difficulty}</span>
                  </div>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="mt-5 inline-flex font-bold text-[#756A8A]"
                  >
                    Відкрити рецепт →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-[#D8D0DC] bg-[#FFFDFF] p-10 text-center">
            <div className="text-4xl text-[#B58FA3]">♡</div>
            <h2 className="mt-4 font-serif text-3xl">Тут поки порожньо</h2>
            <p className="mt-3 text-[#77717D]">
              Додавайте рецепти кнопкою «До обраного».
            </p>
            <Link
              href="/recipes"
              className="mt-6 inline-flex rounded-xl bg-[#756A8A] px-5 py-3 font-bold text-white"
            >
              Перейти до рецептів
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
