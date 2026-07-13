import { externalNames } from "./dictionaries";
import { parseIngredient } from "./ingredient-search";

const suggestionNames = [...new Set(Object.keys(externalNames))].filter(
  (name) => /^[а-яіїєґё’'\s-]+$/i.test(name) && name.length >= 3,
);

const genericIngredients: Record<string, string> = {
  meat: "Уточніть вид м’яса: курка, яловичина, телятина, свинина або індичка.",
  fish: "Уточніть вид риби: лосось, тунець, форель, тріска або скумбрія.",
};

function currentFragment(input: string) {
  return (
    input
      .split(/[,;\n]/)
      .at(-1)
      ?.trim()
      .toLowerCase() || ""
  );
}

export function getIngredientSuggestions(input: string, limit = 6) {
  const fragment = currentFragment(input);
  if (fragment.length < 2 || /\d/.test(fragment)) return [];
  const generic = fragment.replace(/[’']/g, "");
  if (/^(мясо|мясне|meat)$/.test(generic)) {
    return ["курка", "яловичина", "телятина", "свинина", "індичка"];
  }
  if (/^(риба|рыба|fish)$/.test(generic)) {
    return ["лосось", "тунець", "форель", "триска", "скумбрия"];
  }

  return suggestionNames
    .filter((name) => name.startsWith(fragment))
    .sort((left, right) =>
      left === fragment
        ? -1
        : right === fragment
          ? 1
          : left.length - right.length,
    )
    .slice(0, limit);
}

export function applyIngredientSuggestion(input: string, suggestion: string) {
  const match = input.match(/^([\s\S]*[,;\n])([^,;\n]*)$/);
  if (!match) return suggestion;
  const spacer = match[2].startsWith(" ") ? " " : "";
  return `${match[1]}${spacer}${suggestion}`;
}

export function getGenericIngredientWarning(input: string) {
  for (const part of input.split(/[,;\n]+/)) {
    const raw = part
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/\d+(?:[.,]\d+)?\s*(кг|г|гр|мл|л|шт)?/g, "")
      .trim();
    if (/^(мясо|мясо|мясне|meat)$/.test(raw)) return genericIngredients.meat;

    const parsed = parseIngredient(part);
    if (parsed?.canonicalName === "fish" && /^(риба|рыба|fish)$/.test(raw)) {
      return genericIngredients.fish;
    }
  }
  return "";
}
