"use client";

import { useEffect, useState } from "react";

type ScaledIngredientListProps = {
  ingredients: string[];
  baseServings: number;
  recipeId: string;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(value);
}

function scaleIngredient(line: string, ratio: number) {
  return line.replace(/\d+(?:[.,]\d+)?/, (amount) =>
    formatAmount(Number(amount.replace(",", ".")) * ratio),
  );
}

function portionLabel(value: number) {
  const lastTwoDigits = value % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "порцій";
  const lastDigit = value % 10;
  if (lastDigit === 1) return "порція";
  if (lastDigit >= 2 && lastDigit <= 4) return "порції";
  return "порцій";
}

export default function ScaledIngredientList({
  ingredients,
  baseServings,
  recipeId,
}: ScaledIngredientListProps) {
  const safeBaseServings = Math.max(1, baseServings || 1);
  const [servings, setServings] = useState(safeBaseServings);
  const [prepared, setPrepared] = useState<Record<number, boolean>>({});
  const [progressReady, setProgressReady] = useState(false);
  const ratio = servings / safeBaseServings;
  const preparedCount = ingredients.filter((_, index) => prepared[index]).length;
  const progressKey = `marytaste:recipe-progress:${recipeId}:ingredients`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || "null");
      if (saved && typeof saved === "object") {
        if (typeof saved.servings === "number") {
          setServings(Math.max(1, Math.min(99, saved.servings)));
        }
        if (saved.prepared && typeof saved.prepared === "object") {
          setPrepared(saved.prepared);
        }
      }
    } catch {
      // Ignore damaged local progress and start from the recipe defaults.
    }
    setProgressReady(true);
  }, [progressKey]);

  useEffect(() => {
    if (!progressReady) return;
    localStorage.setItem(progressKey, JSON.stringify({ servings, prepared }));
  }, [prepared, progressKey, progressReady, servings]);

  function changeServings(nextValue: number) {
    setServings(Math.max(1, Math.min(99, Math.round(nextValue))));
  }

  return (
    <section className="rounded-3xl bg-[#F0EBF3] p-7 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl">Інгредієнти</h2>
          <p className="mt-1 text-sm text-[#77717D]">
            {preparedCount > 0
              ? `Підготовлено ${preparedCount} з ${ingredients.length}`
              : "Позначайте вже підготовлені продукти"}
          </p>
        </div>
        <div className="flex items-center rounded-xl border border-[#D8CEDD] bg-[#FFFDFF] p-1">
          <button
            type="button"
            onClick={() => changeServings(servings - 1)}
            disabled={servings <= 1}
            aria-label="Зменшити кількість порцій"
            className="grid h-9 w-9 place-items-center rounded-lg text-xl text-[#756A8A] transition hover:bg-[#F0EBF3] disabled:cursor-not-allowed disabled:opacity-35"
          >
            −
          </button>
          <label className="flex min-w-28 items-center justify-center gap-1 text-sm font-bold text-[#504A55]">
            <input
              type="number"
              min="1"
              max="99"
              value={servings}
              onChange={(event) => changeServings(Number(event.target.value) || 1)}
              aria-label="Бажана кількість порцій"
              className="w-8 bg-transparent text-right outline-none"
            />
            <span>{portionLabel(servings)}</span>
          </label>
          <button
            type="button"
            onClick={() => changeServings(servings + 1)}
            disabled={servings >= 99}
            aria-label="Збільшити кількість порцій"
            className="grid h-9 w-9 place-items-center rounded-lg text-xl text-[#756A8A] transition hover:bg-[#F0EBF3] disabled:cursor-not-allowed disabled:opacity-35"
          >
            +
          </button>
        </div>
      </div>
      <ul className="mt-6 space-y-2">
        {ingredients.map((item, index) => {
          const isPrepared = Boolean(prepared[index]);
          return (
            <li key={`${item}-${index}`}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-b border-[#DED4E2] px-2 py-3 transition last:border-0 hover:bg-white/45 ${isPrepared ? "text-[#928B96]" : "text-[#35313B]"}`}
              >
                <input
                  type="checkbox"
                  checked={isPrepared}
                  onChange={(event) =>
                    setPrepared((current) => ({
                      ...current,
                      [index]: event.target.checked,
                    }))
                  }
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-[#A79CAE] bg-[#FFFDFF] text-sm font-bold text-transparent transition peer-checked:border-[#756A8A] peer-checked:bg-[#756A8A] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-[#756A8A]/20"
                >
                  ✓
                </span>
                <span className={isPrepared ? "line-through decoration-[#A79CAE]" : ""}>
                  {scaleIngredient(item, ratio)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
