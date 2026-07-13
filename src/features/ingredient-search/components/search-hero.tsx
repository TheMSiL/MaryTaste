import type { FormEventHandler } from "react";
import IngredientComposer from "./ingredient-composer";
import { hasCompleteIngredientQuantities } from "../ingredient-search";

type SearchHeroProps = {
  input: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  warning: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function SearchHero({
  input,
  onInputChange,
  onClear,
  warning,
  onSubmit,
}: SearchHeroProps) {
  const quantitiesComplete = hasCompleteIngredientQuantities(input);

  return (
    <section className="mx-auto max-w-360 px-4 py-10 max-[450px]:py-8 sm:px-5 sm:py-12 lg:px-10 lg:py-20">
      <div className="grid items-center gap-10 max-[450px]:gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[#B58FA3]">
            Розумний підбір
          </p>
          <h1 className="mt-4 font-serif text-[2.55rem] leading-[1.02] max-[450px]:text-[2.35rem] min-[480px]:text-5xl sm:text-6xl xl:text-7xl">
            Вечеря вже
            <br />
            <i className="font-normal text-[#655B78]">у холодильнику</i>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#77717D] max-[450px]:mt-5 max-[450px]:text-base max-[450px]:leading-7">
            Розкажіть, які продукти маєте. Ми знайдемо страви, перевіримо
            кількість і порахуємо, скільки порцій вийде.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="rounded-[28px] bg-gradient-to-b from-[#7A6F92] to-[#74688E] p-5 shadow-[0_25px_70px_rgba(116,104,142,.22)] max-[450px]:rounded-3xl max-[450px]:p-4 sm:p-7"
        >
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-[.16em] text-[#F3E5CF]">
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
              className="mt-3 rounded-xl bg-[#F6EDF2] px-4 py-3 text-sm font-medium text-[#765465]"
            >
              {warning}
            </p>
          )}
          <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-[#F3E5CF]/80">
              Оберіть продукт, а потім вкажіть кількість, щоб побачити результат
            </p>
            <button
              disabled={!quantitiesComplete}
              className="rounded-xl bg-[#C18C98] px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#B97F8E] hover:shadow-md active:translate-y-px disabled:opacity-40 disabled:hover:bg-[#C18C98] max-[450px]:w-full"
            >
              Знайти, що приготувати →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
