import { parseIngredient } from "@/features/ingredient-search/ingredient-search";
import type { CalculatorIngredient } from "./portion-calculator";
import { ukrainianIngredientName } from "@/features/ingredient-search/ingredient-catalog";

function displayName(line: string) {
  return line
    .replace(/[—–:]/g, " ")
    .replace(
      /\d+(?:[.,]\d+)?\s*(ст\.\s*л\.|ч\.\s*л\.|зубч\.|зубчик(?:и|ів)?|столов(?:а|і)\s+ложк(?:а|и)|чайн(?:а|і)\s+ложк(?:а|и)|кілограм(?:и|ів)?|кг|грами?|гр|г|мілілітр(?:и|ів)?|мл|літр(?:и|ів)?|л|штук(?:а|и)?|шт).*/i,
      "",
    )
    .trim();
}

export function ingredientLines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[,;\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function correctedIngredientLines(value: FormDataEntryValue | null) {
  return ingredientLines(value).map((line) => {
    const ingredient = parseIngredient(line);
    if (!ingredient) return line;
    const correctedName = ukrainianIngredientName(ingredient.name);
    if (correctedName === ingredient.name) return line;
    return line.replace(new RegExp(`^${escapeRegExp(ingredient.name)}`, "iu"), correctedName);
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function structuredIngredients(lines: string[]) {
  return lines
    .map((line) => ({ line, ingredient: parseIngredient(line) }))
    .filter(({ ingredient }) => ingredient !== null)
    .map(({ line, ingredient }) => ({
      name: line
        .replace(/[—–:]/g, " ")
        .replace(
          /\d+(?:[.,]\d+)?\s*(ст\.\s*л\.|ч\.\s*л\.|зубч\.|зубчик(?:и|ів)?|столов(?:а|і)\s+ложк(?:а|и)|чайн(?:а|і)\s+ложк(?:а|и)|кілограм(?:и|ів)?|кг|грами?|гр|г|мілілітр(?:и|ів)?|мл|літр(?:и|ів)?|л|штук(?:а|и)?|шт).*/i,
          "",
        )
        .replace(/\s*-?\s*(чайна|столова|чайні|столові)\s+ложк[а-яіїєґ]*/i, "")
        .trim(),
      canonicalName: ingredient!.canonicalName,
      amount: ingredient!.amount,
      unit: ingredient!.unit,
      recognized: ingredient!.recognized,
    }));
}

export function missingStructuredIngredientsColumn(message: string) {
  return message.includes("structured_ingredients");
}

export function calculatorIngredients(
  structuredValue: unknown,
  legacyValue: unknown,
): CalculatorIngredient[] {
  const legacyLines = Array.isArray(legacyValue)
    ? legacyValue.map(String)
    : String(legacyValue || "")
        .split("\n")
        .filter(Boolean);

  if (Array.isArray(structuredValue) && structuredValue.length) {
    return structuredValue.flatMap((item, index) => {
      if (!item || typeof item !== "object") return [];
      const ingredient = item as Record<string, unknown>;
      if (
        typeof ingredient.amount !== "number" ||
        ingredient.amount <= 0 ||
        typeof ingredient.unit !== "string" ||
        !ingredient.unit
      ) {
        return [];
      }
      return [
        {
          name:
            displayName(legacyLines[index] || "") ||
            String(ingredient.name || "Продукт"),
          amount: ingredient.amount,
          unit: ingredient.unit,
        },
      ];
    });
  }

  return legacyLines.flatMap((line) => {
    const parsed = parseIngredient(line);
    if (!parsed?.amount || !parsed.unit) return [];
    return [
      { name: displayName(line), amount: parsed.amount, unit: parsed.unit },
    ];
  });
}
