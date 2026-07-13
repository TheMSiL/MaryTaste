"use client";

import { useMemo, useState } from "react";

export type CalculatorIngredient = {
  name: string;
  amount: number;
  unit: string;
};

type PortionCalculatorProps = {
  ingredients: CalculatorIngredient[];
  baseServings: number;
};

function portionLabel(value: number) {
  if (value === 1) return "порція";
  if (value >= 2 && value <= 4) return "порції";
  return "порцій";
}

export default function PortionCalculator({
  ingredients,
  baseServings,
}: PortionCalculatorProps) {
  const [available, setAvailable] = useState<Record<number, string>>({});
  const completed = ingredients.every(
    (_, index) => Number(available[index]) > 0,
  );
  const portions = useMemo(() => {
    if (!completed || !ingredients.length) return null;
    const ratio = Math.min(
      ...ingredients.map(
        (ingredient, index) => Number(available[index]) / ingredient.amount,
      ),
    );
    return Math.max(0, Math.floor(baseServings * ratio));
  }, [available, baseServings, completed, ingredients]);

  if (!ingredients.length) return null;

  return (
    <section className="mt-10 overflow-hidden rounded-3xl bg-[#315c42] text-white shadow-[0_20px_55px_rgba(49,92,66,.18)]">
      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[.8fr_1.2fr] lg:p-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-white/60">
            Калькулятор порцій
          </p>
          <h2 className="mt-3 font-serif text-3xl">
            Скільки вийде приготувати?
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
            Вкажіть, скільки кожного продукту маєте. Розрахунок врахує
            інгредієнт, якого вистачає на найменшу кількість порцій.
          </p>
          <div className="mt-6 min-h-24 rounded-2xl bg-white/10 p-5">
            {portions === null ? (
              <p className="text-sm leading-6 text-white/65">
                Заповніть кількість усіх продуктів праворуч.
              </p>
            ) : portions > 0 ? (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                  Орієнтовний результат
                </p>
                <p className="mt-1 font-serif text-4xl">
                  {portions} {portionLabel(portions)}
                </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-[#ffd5c4]">
                Продуктів недостатньо навіть для однієї повної порції.
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <label
              key={`${ingredient.name}-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_100px_40px] items-center gap-2 rounded-xl bg-white/10 p-2 pl-4"
            >
              <span className="min-w-0 truncate text-sm font-semibold">
                {ingredient.name}
              </span>
              <input
                type="number"
                min="0.01"
                step="any"
                value={available[index] || ""}
                onChange={(event) =>
                  setAvailable((current) => ({
                    ...current,
                    [index]: event.target.value,
                  }))
                }
                placeholder="К-сть"
                className="h-10 min-w-0 rounded-lg border border-white/20 bg-white px-3 text-sm text-[#28251f] outline-none focus:ring-4 focus:ring-white/15"
              />
              <span className="text-center text-xs font-bold text-white/65">
                {ingredient.unit}
              </span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
