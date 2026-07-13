import type { FormEventHandler } from "react";
import IngredientComposer from "./ingredient-composer";
import {
  hasCompleteIngredientQuantities,
  parseIngredient,
} from "../ingredient-search";

type SearchHeroProps = {
  input: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  warning: string;
  autoUpdatePending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function SearchHero({
  input,
  onInputChange,
  onClear,
  warning,
  autoUpdatePending,
  onSubmit,
}: SearchHeroProps) {
  const selectedIngredients = input
    .split(/[,;\n]+/)
    .map(parseIngredient)
    .filter((ingredient) => ingredient !== null);
  const quantitiesComplete = hasCompleteIngredientQuantities(input);

  return (
    <section className="mx-auto max-w-360 px-4 py-10 sm:px-5 sm:py-12 lg:px-10 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[#b55d3a]">
            Розумний підбір
          </p>
          <h1 className="mt-4 font-serif text-[2.55rem] leading-[1.02] min-[480px]:text-5xl sm:text-6xl xl:text-7xl">
            Вечеря вже
            <br />
            <i className="font-normal text-[#315c42]">у холодильнику</i>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#716b61]">
            Розкажіть, які продукти маєте. Ми знайдемо страви, перевіримо
            кількість і порахуємо, скільки порцій вийде.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="rounded-[28px] bg-[#315c42] p-5 shadow-[0_25px_70px_rgba(49,92,66,.2)] sm:p-7"
        >
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-[.16em] text-white/65">
              Що є вдома?
            </label>
            {input && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold text-white/65 underline decoration-white/30 underline-offset-4 transition hover:text-white"
              >
                Очистити все
              </button>
            )}
          </div>
          <div className="mt-3 rounded-2xl bg-white/10 p-2">
            <IngredientComposer value={input} onChange={onInputChange} />
          </div>
          {warning && (
            <p
              role="alert"
              className="mt-3 rounded-xl bg-[#fff0df] px-4 py-3 text-sm font-medium text-[#81502f]"
            >
              {warning}
            </p>
          )}
          <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-white/60">
              Оберіть продукт, а потім вкажіть кількість, щоб побачити результат
            </p>
            <button
              disabled={!quantitiesComplete}
              className="rounded-xl bg-[#b85c38] px-6 py-3.5 font-bold text-white disabled:opacity-40"
            >
              Знайти, що приготувати →
            </button>
          </div>
          <div
            aria-live="polite"
            className="mt-2 min-h-5 text-right text-xs leading-5 text-white/55"
          >
            {!quantitiesComplete && selectedIngredients.length > 0
              ? "Вкажіть кількість для кожного продукту"
              : autoUpdatePending
                ? "Оновлюємо результати…"
                : ""}
          </div>
        </form>
      </div>
    </section>
  );
}
