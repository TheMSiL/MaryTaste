"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase";
import {
  hasCompleteIngredientQuantities,
  matchRecipes,
} from "../ingredient-search";
import { fetchExternalMeals } from "../mealdb";
import { getGenericIngredientWarning } from "../ingredient-suggestions";
import type { ExternalMeal, Recipe } from "../types";
import SearchHero from "./search-hero";
import SearchResults from "./search-results";
import SiteHeader from "./site-header";

export default function IngredientSearchPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [external, setExternal] = useState<ExternalMeal[]>([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState("");
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState("");
  const [inputWarning, setInputWarning] = useState("");
  const searchRequestRef = useRef(0);

  useEffect(() => {
    const savedInput =
      window.localStorage.getItem("marytaste-ingredients") ||
      window.localStorage.getItem("mariyka-ingredients");
    if (savedInput) queueMicrotask(() => setInput(savedInput));
    createClient()
      .from("recipes")
      .select(
        "id,title,description,servings,image_url,ingredients,structured_ingredients",
      )
      .then(({ data, error }) => {
        if (error) setRecipesError("Не вдалося завантажити домашні рецепти.");
        else setRecipes((data || []) as Recipe[]);
        setRecipesLoading(false);
      });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("marytaste-ingredients", input);
  }, [input]);

  const matches = useMemo(
    () => matchRecipes(recipes, search),
    [recipes, search],
  );

  const runSearch = useCallback(async (value: string) => {
    const trimmedInput = value.trim();
    if (!hasCompleteIngredientQuantities(trimmedInput)) {
      setInputWarning("Вкажіть кількість для кожного продукту.");
      return;
    }
    const genericWarning = getGenericIngredientWarning(trimmedInput);
    if (genericWarning) {
      setInputWarning(genericWarning);
      setSearch("");
      setExternal([]);
      return;
    }
    setInputWarning("");
    setSearch(trimmedInput);
    setExternal([]);
    setExternalError("");
    if (!trimmedInput) return;

    const requestId = ++searchRequestRef.current;
    setExternalLoading(true);
    try {
      const meals = await fetchExternalMeals(trimmedInput);
      if (requestId === searchRequestRef.current) setExternal(meals);
    } catch (error) {
      if (requestId !== searchRequestRef.current) return;
      console.error("External recipes loading error:", error);
      setExternalError("Зовнішня база тимчасово недоступна. Спробуйте ще раз.");
      setExternal([]);
    } finally {
      if (requestId === searchRequestRef.current) setExternalLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmedInput = input.trim();
    if (
      !hasCompleteIngredientQuantities(trimmedInput) ||
      trimmedInput === search
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void runSearch(trimmedInput);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [input, runSearch, search]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void runSearch(input);
  }

  return (
    <main className="min-h-screen bg-[#f8f5ee] text-[#28251f]">
      <SiteHeader />
      <SearchHero
        input={input}
        onInputChange={(value) => {
          setInput(value);
          if (inputWarning) setInputWarning("");
        }}
        warning={inputWarning}
        autoUpdatePending={
          hasCompleteIngredientQuantities(input) && input.trim() !== search
        }
        onClear={() => {
          searchRequestRef.current++;
          setInput("");
          setSearch("");
          setExternal([]);
          setExternalError("");
          setInputWarning("");
        }}
        onSubmit={submit}
      />

      <SearchResults
        search={search}
        matches={matches}
        external={external}
        externalLoading={externalLoading}
        externalError={externalError}
        recipesLoading={recipesLoading}
        recipesError={recipesError}
        onClear={() => {
          searchRequestRef.current++;
          setInput("");
          setSearch("");
          setExternal([]);
        }}
      />
    </main>
  );
}
