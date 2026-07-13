"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import PortionCalculator from "@/features/recipes/portion-calculator";
import ScaledIngredientList from "@/features/recipes/scaled-ingredient-list";
import CookingSteps from "@/features/recipes/cooking-steps";
import RecipeActions from "@/features/recipes/recipe-actions";
import { calculatorIngredients } from "@/features/recipes/ingredients";
import TransitionArrow from "@/components/ui/transition-arrow";
import FavoritesLink from "@/components/favorites-link";

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
      <main className="grid min-h-screen place-items-center bg-[#FAF8FC] text-[#77717D]">
        Завантажуємо рецепт…
      </main>
    );
  if (error || !recipe)
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF8FC] px-5 text-center">
        <div>
          <h1 className="font-serif text-4xl">Рецепт не знайдено</h1>
          <p className="mt-3 text-[#77717D]">{error}</p>
          <Link
            href="/"
            className="group mt-6 inline-flex items-center gap-2 font-bold text-[#756A8A]"
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
    <main className="min-h-screen bg-[#FAF8FC] text-[#35313B]">
      <header className="print-hidden border-b border-[#E5DFE9] bg-[#FAF8FC]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-serif text-xl"
          >
            <TransitionArrow back />
            MaryTaste
          </Link>
          <FavoritesLink />
        </div>
      </header>
      <article className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B58FA3]">
              {recipe.category}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">
              {recipe.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#77717D]">
              {recipe.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#FFFDFF] px-4 py-2 text-sm">
                ◷ {recipe.cooking_time} хв
              </span>
              <span className="rounded-full bg-[#FFFDFF] px-4 py-2 text-sm">
                ♙ {recipe.servings} порції
              </span>
              <span className="rounded-full bg-[#FFFDFF] px-4 py-2 text-sm">
                ◇ {recipe.difficulty}
              </span>
            </div>
            <RecipeActions recipeId={id} />
          </div>
          <Image
            src={recipe.image_url || fallbackImage}
            alt={recipe.title}
            width={1200}
            height={900}
            unoptimized={Boolean(recipe.image_url?.includes("supabase.co"))}
            sizes="(max-width: 1023px) 100vw, 50vw"
            priority
            className="aspect-[4/3] h-full w-full rounded-[30px] object-cover shadow-xl shadow-[#6C6570]/10"
          />
        </div>
        <div className="print-hidden">
          <PortionCalculator
            ingredients={calculatorItems}
            baseServings={recipe.servings}
          />
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <ScaledIngredientList
            key={`ingredients-${id}`}
            ingredients={ingredients}
            baseServings={recipe.servings}
            recipeId={id}
          />
          <CookingSteps
            key={`cooking-${id}`}
            steps={instructions}
            recipeId={id}
          />
        </div>
      </article>
    </main>
  );
}
