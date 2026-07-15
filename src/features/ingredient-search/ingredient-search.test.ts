import { describe, expect, it } from "vitest";
import {
  matchRecipes,
  hasCompleteIngredientQuantities,
  normalizeIngredient,
  parseIngredient,
} from "./ingredient-search";
import {
  resolveIngredientName,
  ukrainianIngredientName,
} from "./ingredient-catalog";
import {
  applyIngredientSuggestion,
  getGenericIngredientWarning,
  getIngredientSuggestions,
} from "./ingredient-suggestions";
import type { Recipe } from "./types";
import { externalQueriesForIngredient } from "./mealdb";

describe("ingredient catalog", () => {
  it("resolves Ukrainian veal to the TheMealDB canonical name", () => {
    expect(resolveIngredientName("телятина")).toMatchObject({
      canonicalName: "veal",
      recognized: true,
    });
  });

  it("normalizes Russian and Ukrainian aliases to one product", () => {
    expect(normalizeIngredient("огірки")).toBe("огірок");
    expect(normalizeIngredient("огурцы")).toBe("огірок");
  });

  it("preserves Ukrainian letters in display names and resolves salt", () => {
    expect(parseIngredient("Сіль 5 г")).toMatchObject({
      name: "сіль",
      canonicalName: "salt",
    });
  });

  it("corrects a Russian ingredient name to Ukrainian", () => {
    expect(ukrainianIngredientName("Кефир")).toBe("кефір");
    expect(resolveIngredientName("кефір").canonicalName).toBe("kefir");
  });
});

describe("parseIngredient", () => {
  it("parses and converts kilograms to grams", () => {
    expect(parseIngredient("Кабачок — 1,5 кг")).toMatchObject({
      canonicalName: "zucchini",
      amount: 1500,
      unit: "г",
    });
  });

  it("keeps an unknown product but marks it as unrecognized", () => {
    expect(parseIngredient("дивний продукт 2 шт")).toMatchObject({
      canonicalName: "дивний продукт",
      recognized: false,
      amount: 2,
      unit: "шт",
    });
  });

  it("parses recipe spoon units without adding them to the name", () => {
    expect(parseIngredient("Оливкова олія 2 ст. л.")).toMatchObject({
      name: "оливкова олія",
      amount: 2,
      unit: "ст. л.",
    });
    expect(parseIngredient("Сіль 1 ч. л.")).toMatchObject({
      name: "сіль",
      amount: 1,
      unit: "ч. л.",
    });
  });

  it("parses garlic cloves for structured admin recipes", () => {
    expect(parseIngredient("Часник 2 зубч.")).toMatchObject({
      name: "часник",
      amount: 2,
      unit: "зубч.",
    });
  });
});

describe("matchRecipes", () => {
  const recipe: Recipe = {
    id: "recipe-1",
    title: "Овочева вечеря",
    description: "",
    servings: 4,
    image_url: null,
    ingredients: ["Кабачок — 500 г", "Цибуля — 2 шт"],
    structured_ingredients: [
      {
        name: "кабачок",
        canonicalName: "zucchini",
        recognized: true,
        amount: 500,
        unit: "г",
      },
      {
        name: "цибуля",
        canonicalName: "onion",
        recognized: true,
        amount: 2,
        unit: "шт",
      },
    ],
  };

  it("matches canonical ingredients and reports missing products", () => {
    const [match] = matchRecipes([recipe], "цуккини 250 г");
    expect(match.found).toBe(1);
    expect(match.matchedIngredients).toEqual(["Кабачок"]);
    expect(match.missingIngredients).toEqual(["Цибуля"]);
    expect(match.portions).toBe(2);
  });

  it("marks portions as approximate when amount is omitted", () => {
    const [match] = matchRecipes([recipe], "кабачок, цибуля");
    expect(match.unknownQuantityIngredients).toEqual(["Кабачок", "Цибуля"]);
  });
});

describe("ingredient input assistance", () => {
  it("suggests products for the current list fragment", () => {
    expect(getIngredientSuggestions("цибуля, тел")).toContain("телятина");
  });

  it("includes recipe ingredients from the shared catalog", () => {
    expect(getIngredientSuggestions("бат", 6, ["батат"])).toContain("батат");
  });

  it("replaces only the current fragment", () => {
    expect(applyIngredientSuggestion("цибуля, тел", "телятина")).toBe(
      "цибуля, телятина",
    );
  });

  it("asks to specify generic meat and fish", () => {
    expect(getGenericIngredientWarning("м’ясо 500 г")).toContain("вид м’яса");
    expect(getGenericIngredientWarning("риба")).toContain("вид риби");
    expect(getGenericIngredientWarning("лосось")).toBe("");
  });

  it("offers concrete products instead of generic meat and fish", () => {
    expect(getIngredientSuggestions("м’ясо")).toContain("телятина");
    expect(getIngredientSuggestions("риба")).toContain("лосось");
    expect(getIngredientSuggestions("риба")).not.toContain("риба");
  });
});

describe("TheMealDB query mapping", () => {
  it("expands generic mince into concrete external ingredients", () => {
    const mince = parseIngredient("фарш 500 г");
    expect(mince).not.toBeNull();
    expect(externalQueriesForIngredient(mince!)).toEqual(
      expect.arrayContaining(["minced beef", "ground beef", "minced pork"]),
    );
  });

  it("keeps a concrete ingredient as one query", () => {
    const veal = parseIngredient("телятина 500 г");
    expect(veal).not.toBeNull();
    expect(externalQueriesForIngredient(veal!)).toEqual(["veal"]);
  });
});

describe("quantity validation", () => {
  it("requires a positive amount for every selected product", () => {
    expect(hasCompleteIngredientQuantities("курка 500 г, цибуля 2 шт")).toBe(
      true,
    );
    expect(hasCompleteIngredientQuantities("курка, цибуля 2 шт")).toBe(false);
    expect(hasCompleteIngredientQuantities("курка 0 г")).toBe(false);
  });
});
