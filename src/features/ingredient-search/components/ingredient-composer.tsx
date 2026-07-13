"use client";

import { useMemo, useState } from "react";
import CustomSelect from "@/components/ui/custom-select";
import { parseIngredient } from "../ingredient-search";
import { getIngredientSuggestions } from "../ingredient-suggestions";

type IngredientComposerProps = {
  value: string;
  onChange: (value: string) => void;
  recipeMode?: boolean;
};

const searchUnits = ["г", "кг", "мл", "л", "шт"];
const recipeUnits = [...searchUnits, "ч. л.", "ст. л.", "зубч."];

const toOptions = (units: string[]) =>
  units.map((unit) => ({
    value: unit,
    label: unit,
  }));

type ComposerItem = { name: string; amount: string; unit: string };

function itemsFromValue(value: string): ComposerItem[] {
  return value
    .split(/[,;\n]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parsed = parseIngredient(line);
      const quantity = line.match(
        /(\d+(?:[.,]\d+)?)\s*(ст\.\s*л\.|ч\.\s*л\.|зубч\.|кг|г|гр|мл|л|шт)(?=\s|$)/i,
      );
      return {
        name: parsed?.name || line,
        amount: quantity?.[1].replace(",", ".") || "",
        unit: quantity?.[2].toLowerCase().replace("гр", "г") || "г",
      };
    });
}

function serialize(items: ComposerItem[]) {
  return items
    .map((item) =>
      item.amount ? `${item.name} ${item.amount} ${item.unit}` : item.name,
    )
    .join(", ");
}

export default function IngredientComposer({
  value,
  onChange,
  recipeMode = false,
}: IngredientComposerProps) {
  const [draft, setDraft] = useState("");
  const items = useMemo(() => itemsFromValue(value), [value]);
  const suggestions = useMemo(
    () =>
      getIngredientSuggestions(draft).filter(
        (suggestion) => !items.some((item) => item.name === suggestion),
      ),
    [draft, items],
  );
  const unitOptions = useMemo(
    () => toOptions(recipeMode ? recipeUnits : searchUnits),
    [recipeMode],
  );

  function updateItem(index: number, patch: Partial<ComposerItem>) {
    onChange(
      serialize(
        items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...patch } : item,
        ),
      ),
    );
  }

  function addItem(name: string) {
    onChange(serialize([...items, { name, amount: "", unit: "г" }]));
    setDraft("");
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="mb-3 space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_72px_72px_34px] items-center gap-2 rounded-xl bg-[#eef4ef] p-2 text-[#315c42]"
            >
              <span className="min-w-0 truncate pl-2 text-sm font-semibold">
                {item.name}
              </span>
              <input
                type="number"
                min="0.01"
                step="any"
                value={item.amount}
                onChange={(event) =>
                  updateItem(index, { amount: event.target.value })
                }
                placeholder="К-сть"
                aria-label={`Кількість: ${item.name}`}
                className="h-9 min-w-0 rounded-lg border border-[#cdd9cf] bg-white px-2 text-sm text-[#28251f] outline-none focus:border-[#315c42] focus:ring-2 focus:ring-[#315c42]/10"
              />
              <CustomSelect
                compact
                label={`Одиниця: ${item.name}`}
                name={`unit-${index}`}
                options={unitOptions}
                value={item.unit}
                onChange={(unit) => updateItem(index, { unit })}
              />
              <button
                type="button"
                onClick={() =>
                  onChange(
                    serialize(
                      items.filter((_, itemIndex) => itemIndex !== index),
                    ),
                  )
                }
                aria-label={`Видалити ${item.name}`}
                className="grid h-8 w-8 place-items-center rounded-full text-lg text-[#718175] transition hover:bg-white hover:text-[#b55d3a] active:scale-90"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            items.length
              ? "Додати ще продукт…"
              : "Почніть писати: курка, кабачок…"
          }
          aria-label="Знайти продукт"
          className="h-13 w-full rounded-xl border border-transparent bg-white px-4 text-base text-[#28251f] outline-none transition placeholder:text-[#aaa398] focus:border-[#b7cbbd] focus:ring-4 focus:ring-white/10"
        />
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#ded8ca] bg-[#fffdf8] p-2 shadow-[0_18px_45px_rgba(20,40,28,.22)]">
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#8a8275]">
              Оберіть продукт
            </p>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addItem(suggestion)}
                className="flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm text-[#49443c] transition hover:bg-[#e7f0e9] hover:text-[#315c42]"
              >
                {suggestion}
                <span aria-hidden="true">＋</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
