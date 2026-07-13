import { externalNames, ingredientAliases } from "./dictionaries";

export type ResolvedIngredient = {
  canonicalName: string;
  normalizedName: string;
  recognized: boolean;
};

export function resolveIngredientName(value: string): ResolvedIngredient {
  const words = value
    .split(" ")
    .filter(Boolean)
    .map((word) => ingredientAliases[word] || word);
  const normalizedName = words.join(" ");
  const firstWord = normalizedName.split(" ")[0];
  const canonicalName =
    externalNames[normalizedName] ||
    externalNames[firstWord] ||
    normalizedName;

  return {
    canonicalName,
    normalizedName,
    recognized:
      canonicalName !== normalizedName ||
      Boolean(externalNames[normalizedName] || externalNames[firstWord]),
  };
}
