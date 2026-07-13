import { resolveIngredientName } from "./ingredient-catalog";
import type { Ingredient, Match, Recipe } from "./types";

const phraseAliases: Record<string, string> = {
  "bell pepper": "перець",
  "sweet pepper": "перець",
  "sour cream": "сметана",
  "cottage cheese": "творог",
  "cream cheese": "вершковий сир",
  "tomato paste": "томатна паста",
  "vegetable oil": "олія",
  "olive oil": "оливкова олія",
  "minced meat": "фарш",
  "ground beef": "фарш",
  "oyster mushrooms": "глива",
  "green peas": "горох",
  "black olives": "оливки",
};

const sortedPhraseAliases = Object.entries(phraseAliases).sort(
  ([left], [right]) => right.length - left.length,
);

export function normalizeIngredient(value: string) {
  let normalized = value
    .toLowerCase()
    .replace(/\b(у мене|у нас|є|маю|ще|приблизно)\b/g, " ")
    .replace(/[^а-яіїєґa-z’'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const [alias, canonical] of sortedPhraseAliases) {
    normalized = normalized.split(alias).join(canonical);
  }

  return resolveIngredientName(normalized).normalizedName;
}

export function parseIngredient(value: string): Ingredient | null {
  const cleaned = value.replace(/[—–:]/g, " ").trim();
  const match = cleaned.match(
    /(\d+(?:[.,]\d+)?)\s*(ст\.\s*л\.|ч\.\s*л\.|зубч\.|зубчик(?:и|ів)?|столов(?:а|і)\s+ложк(?:а|и)|чайн(?:а|і)\s+ложк(?:а|и)|кілограм(?:и|ів|мів)?|кг|грамм?(?:и|ів|ов)?|грами|гр|г|мілілітр(?:и|ів)?|мл|літр(?:и|ів)?|л|штук(?:а|и)?|шт)(?=\s|[.,;)]|$)/i,
  );
  const amount = match ? Number(match[1].replace(",", ".")) : null;
  const rawUnit = match?.[2].toLowerCase() || "";
  let unit = rawUnit.startsWith("зубч")
    ? "зубч."
    : rawUnit.startsWith("ст.") || rawUnit.startsWith("столов")
      ? "ст. л."
      : rawUnit.startsWith("ч.") || rawUnit.startsWith("чайн")
        ? "ч. л."
        : rawUnit.startsWith("кілограм") || rawUnit === "кг"
          ? "кг"
          : rawUnit.startsWith("г")
            ? "г"
            : rawUnit.startsWith("мілі") || rawUnit === "мл"
              ? "мл"
              : rawUnit.startsWith("л")
                ? "л"
                : rawUnit.startsWith("шт")
                  ? "шт"
                  : "";
  let normalizedAmount = amount;

  if (amount !== null && (unit === "кг" || unit === "л")) {
    normalizedAmount = amount * 1000;
    unit = unit === "кг" ? "г" : "мл";
  }

  const name = normalizeIngredient(
    match
      ? `${cleaned.slice(0, match.index)} ${cleaned.slice((match.index || 0) + match[0].length)}`
      : cleaned,
  );

  if (!name) return null;
  const resolved = resolveIngredientName(name);
  return {
    name: resolved.normalizedName,
    canonicalName: resolved.canonicalName,
    recognized: resolved.recognized,
    amount: normalizedAmount,
    unit,
  };
}

function ingredientList(value: unknown) {
  let items: string[] = [];
  if (Array.isArray(value)) items = value.map(String);
  else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      items = Array.isArray(parsed) ? parsed.map(String) : [value];
    } catch {
      items = value.split("\n");
    }
  }
  return items.filter((item) => item.trim() && !item.trim().endsWith(":"));
}

function displayIngredientName(value: string) {
  return value
    .replace(/[—–:]/g, " ")
    .replace(
      /\d+(?:[.,]\d+)?\s*(ст\.\s*л\.|ч\.\s*л\.|зубч\.|зубчик(?:и|ів)?|столов(?:а|і)\s+ложк(?:а|и)|чайн(?:а|і)\s+ложк(?:а|и)|кілограм(?:и|ів)?|кг|грами?|гр|г|мілілітр(?:и|ів)?|мл|літр(?:и|ів)?|л|штук(?:а|и)?|шт).*/i,
      "",
    )
    .replace(/\s*-?\s*(чайна|столова|чайні|столові)\s+ложк[а-яіїєґ]*/i, "")
    .trim();
}

function shouldShowMissingIngredient(value: string) {
  const normalized = value.toLowerCase().replace(/[’']/g, "");
  return !/^(кипяток|окріп|вода)$/.test(normalized);
}

function structuredIngredientList(
  value: unknown,
  legacyValue: unknown,
): Ingredient[] {
  if (!Array.isArray(value)) return [];
  const legacyNames = ingredientList(legacyValue).map(displayIngredientName);
  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    const name = String(candidate.name || "").trim();
    const canonicalName = String(candidate.canonicalName || "").trim();
    if (!name || !canonicalName) return [];
    const displayName = legacyNames[index] || name;
    const resolvedDisplayName = resolveIngredientName(
      displayName.toLowerCase(),
    );
    return [
      {
        name: displayName,
        canonicalName: resolvedDisplayName.recognized
          ? resolvedDisplayName.canonicalName
          : canonicalName,
        recognized:
          resolvedDisplayName.recognized || Boolean(candidate.recognized),
        amount: typeof candidate.amount === "number" ? candidate.amount : null,
        unit: typeof candidate.unit === "string" ? candidate.unit : "",
      },
    ];
  });
}

function ingredientsMatch(
  leftName: string,
  rightName: string,
  leftCanonical: string,
  rightCanonical: string,
) {
  if (leftCanonical === rightCanonical) return true;
  const normalizedLeftName = leftName.toLowerCase();
  const normalizedRightName = rightName.toLowerCase();
  if (normalizedLeftName === normalizedRightName) return true;
  const left = normalizedLeftName.split(" ").filter((word) => word.length >= 4);
  const right = normalizedRightName
    .split(" ")
    .filter((word) => word.length >= 4);
  return left.some((x) => right.some((y) => x.includes(y) || y.includes(x)));
}

export function matchRecipes(recipes: Recipe[], search: string): Match[] {
  if (!search) return [];
  const available = search
    .split(/[,;\n]+/)
    .map(parseIngredient)
    .filter((item): item is Ingredient => item !== null);

  return recipes
    .map((recipe) => {
      const structured = structuredIngredientList(
        recipe.structured_ingredients,
        recipe.ingredients,
      );
      const needed = structured.length
        ? structured
        : ingredientList(recipe.ingredients)
            .map(parseIngredient)
            .filter((item): item is Ingredient => item !== null);
      let ratio = 1;
      let found = 0;
      let limiting: Match["limiting"];
      const matchedIngredients: string[] = [];
      const missingIngredients: string[] = [];
      const unknownQuantityIngredients: string[] = [];

      for (const need of needed) {
        const have = available.find((item) =>
          ingredientsMatch(
            item.name,
            need.name,
            item.canonicalName,
            need.canonicalName,
          ),
        );
        if (!have) {
          if (shouldShowMissingIngredient(need.name)) {
            missingIngredients.push(need.name);
          }
          continue;
        }
        found++;
        matchedIngredients.push(need.name);
        if (
          have.amount === null ||
          need.amount === null ||
          !have.unit ||
          !need.unit
        ) {
          unknownQuantityIngredients.push(need.name);
        }
        if (
          have.amount !== null &&
          need.amount !== null &&
          have.unit === need.unit
        ) {
          const current = have.amount / need.amount;
          if (current < ratio) {
            ratio = current;
            limiting = {
              name: need.name,
              have: have.amount,
              need: need.amount,
              unit: need.unit,
            };
          }
        }
      }

      return {
        recipe,
        found,
        total: needed.length,
        matchedIngredients,
        missingIngredients,
        unknownQuantityIngredients,
        ratio,
        limiting,
        portions: Math.max(1, Math.floor(recipe.servings * Math.min(ratio, 1))),
      };
    })
    .filter((item) => item.found > 0)
    .sort((left, right) => right.found / right.total - left.found / left.total)
    .slice(0, 4);
}

export function formatPortions(value: number) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${value} повних порцій`;
  if (last === 1) return `${value} повна порція`;
  if (last >= 2 && last <= 4) return `${value} повні порції`;
  return `${value} повних порцій`;
}

export function hasCompleteIngredientQuantities(input: string) {
  const ingredients = input
    .split(/[,;\n]+/)
    .map(parseIngredient)
    .filter((ingredient): ingredient is Ingredient => ingredient !== null);
  return (
    ingredients.length > 0 &&
    ingredients.every(
      (ingredient) => ingredient.amount !== null && ingredient.amount > 0,
    )
  );
}
