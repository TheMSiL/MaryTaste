"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import PortionCalculator from "@/features/recipes/portion-calculator";
import { calculatorIngredients } from "@/features/recipes/ingredients";
import TransitionArrow from "@/components/ui/transition-arrow";

type Recipe = {
  title: string;
  description: string;
  category: string;
  cooking_time: number;
  servings: number;
  difficulty: string;
  image_url: string | null;
  ingredients: unknown;
  instructions: unknown;
  structured_ingredients?: unknown;
};
const fallbackImage =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=85";

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [value];
    } catch {
      return value.split("\n").filter(Boolean);
    }
  }
  return [];
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    createClient()
      .from("recipes")
      .select(
        "title,description,category,cooking_time,servings,difficulty,image_url,ingredients,instructions,structured_ingredients",
      )
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRecipe(data);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f5ee] text-[#716b61]">
        Завантажуємо рецепт…
      </main>
    );
  if (error || !recipe)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f5ee] px-5 text-center">
        <div>
          <h1 className="font-serif text-4xl">Рецепт не знайдено</h1>
          <p className="mt-3 text-[#716b61]">{error}</p>
          <Link
            href="/"
            className="group mt-6 inline-flex items-center gap-2 font-bold text-[#315c42]"
          >
            <TransitionArrow back />
            Повернутися до рецептів
          </Link>
        </div>
      </main>
    );

  const ingredients = toList(recipe.ingredients);
  const instructions = toList(recipe.instructions);
  const calculatorItems = calculatorIngredients(
    recipe.structured_ingredients,
    recipe.ingredients,
  );
  return (
    <main className="min-h-screen bg-[#f8f5ee] text-[#28251f]">
      <header className="border-b border-[#ded8ca] bg-[#f8f5ee]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-serif text-xl"
          >
            <TransitionArrow back />
            MaryTaste
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b55d3a]">
              {recipe.category}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">
              {recipe.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#716b61]">
              {recipe.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-sm">
                ◷ {recipe.cooking_time} хв
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm">
                ♙ {recipe.servings} порції
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm">
                ◇ {recipe.difficulty}
              </span>
            </div>
          </div>
          <Image
            src={recipe.image_url || fallbackImage}
            alt={recipe.title}
            width={1200}
            height={900}
            unoptimized={Boolean(recipe.image_url?.includes("supabase.co"))}
            sizes="(max-width: 1023px) 100vw, 50vw"
            priority
            className="aspect-[4/3] h-full w-full rounded-[30px] object-cover shadow-xl shadow-[#514632]/10"
          />
        </div>
        <PortionCalculator
          ingredients={calculatorItems}
          baseServings={recipe.servings}
        />
        <div className="mt-14 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-3xl bg-[#e9dfca] p-7 md:p-9">
            <h2 className="font-serif text-3xl">Інгредієнти</h2>
            <ul className="mt-6 space-y-3">
              {ingredients.map((item, index) => (
                <li
                  key={index}
                  className="flex gap-3 border-b border-[#d6c8ae] pb-3 last:border-0"
                >
                  <span className="text-[#315c42]">●</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-3xl border border-[#ded8ca] bg-white p-7 md:p-9">
            <h2 className="font-serif text-3xl">Приготування</h2>
            <ol className="mt-7 space-y-7">
              {instructions.map((step, index) => (
                <li key={index} className="flex gap-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#315c42] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 leading-7 text-[#5f594f]">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </main>
  );
}
