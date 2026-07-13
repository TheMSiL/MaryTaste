import Image from "next/image";
import Link from "next/link";
import type { ExternalMeal, Match } from "../types";
import TransitionArrow from "@/components/ui/transition-arrow";

type SearchResultsProps = {
  search: string;
  matches: Match[];
  external: ExternalMeal[];
  externalLoading: boolean;
  externalError: string;
  recipesLoading: boolean;
  recipesError: string;
  onClear: () => void;
};

function cleanIngredientLabel(value: string) {
  const cleaned = value
    .replace(/\bолия\b/gi, "олія")
    .replace(/\bоливкова олия\b/gi, "оливкова олія")
    .replace(/\bсиль\b/gi, "сіль")
    .replace(
      /\s*[-—–]?\s*(чайна|столова|чайні|столові|чайни|столови)\s+ложк[а-яіїєґ]*/i,
      "",
    )
    .trim();
  const compact = cleaned.toLowerCase().replace(/[’'\s-]/g, "");
  if (["кипяток", "окріп", "вода"].includes(compact)) return "";
  return cleaned;
}

export default function SearchResults({
  search,
  matches,
  external,
  externalLoading,
  externalError,
  recipesLoading,
  recipesError,
  onClear,
}: SearchResultsProps) {
  if (!search) return null;

  return (
    <section className="mx-auto max-w-360 px-5 pb-20 lg:px-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b55d3a]">
            Перевірено за вашими продуктами
          </p>
          <h2 className="mt-2 font-serif text-4xl">Рецепти MaryTaste</h2>
        </div>
        <button onClick={onClear} className="text-sm underline">
          Очистити
        </button>
      </div>
      {recipesLoading ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-3xl bg-white"
            />
          ))}
        </div>
      ) : recipesError ? (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {recipesError}
        </p>
      ) : matches.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {matches.map(
            ({
              recipe,
              found,
              total,
              ratio,
              matchedIngredients,
              missingIngredients,
            }) => (
              <article
                key={recipe.id}
                className="grid overflow-hidden rounded-3xl border border-[#ded8ca] bg-white sm:grid-cols-[180px_1fr]"
              >
                <div className="relative min-h-44 bg-[#e9dfca]">
                  {recipe.image_url && (
                    <Image
                      src={recipe.image_url}
                      alt={recipe.title}
                      fill
                      unoptimized={recipe.image_url.includes("supabase.co")}
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold text-[#315c42]">
                    Є {found} з {total} інгредієнтів
                  </p>
                  <h3 className="mt-1 font-serif text-2xl">{recipe.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    {matchedIngredients.slice(0, 3).map((ingredient) => (
                      <span
                        key={`matched-${ingredient}`}
                        className="rounded-full bg-[#e7f0e9] px-2.5 py-1 text-[#315c42]"
                      >
                        ✓ {ingredient}
                      </span>
                    ))}
                    {missingIngredients
                      .map(cleanIngredientLabel)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((ingredient) => (
                        <span
                          key={`missing-${ingredient}`}
                          className="rounded-full bg-[#f6ece6] px-2.5 py-1 text-[#9a5633]"
                        >
                          − {ingredient}
                        </span>
                      ))}
                  </div>
                  {missingIngredients.length === 0 && ratio < 1 && (
                    <p className="mt-3 rounded-xl bg-[#faf1e9] px-3 py-2.5 text-sm leading-5 text-[#75442f]">
                      Усі продукти є, але кількості може не вистачити. Перевірте
                      точну кількість порцій у рецепті.
                    </p>
                  )}
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="group mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#315c42]"
                  >
                    Відкрити рецепт
                    <TransitionArrow />
                  </Link>
                </div>
              </article>
            ),
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-[#cfc7b8] p-10 text-center text-[#716b61]">
          У колекції MaryTaste збігів поки немає.
        </div>
      )}

      <div className="mt-14 border-t border-[#ded8ca] pt-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8a8275]">
              Ідеї з відкритої бази TheMealDB
            </p>
            <h2 className="mt-2 font-serif text-3xl">Ще можна спробувати</h2>
          </div>
          <p className="max-w-lg rounded-xl bg-[#fff0df] px-4 py-3 text-sm font-medium text-[#81502f]">
            ⚠ Не рецепти MaryTaste. Дані не перевірені — готуйте з обережністю.
          </p>
        </div>
        {externalLoading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((x) => (
              <div
                key={x}
                className="h-72 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : externalError ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {externalError}
          </p>
        ) : external.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {external.map((meal) => (
              <article
                key={meal.idMeal}
                className="overflow-hidden rounded-2xl border border-[#dfd5c6] bg-white"
              >
                <div className="relative aspect-4/3">
                  <Image
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <span className="rounded-full bg-[#fff0df] px-2.5 py-1 text-[10px] font-bold uppercase text-[#9a5633]">
                    Зовнішній рецепт
                  </span>
                  <h3 className="mt-3 font-serif text-xl leading-tight">
                    {meal.strMeal}
                  </h3>
                  <a
                    href={`https://www.themealdb.com/meal/${meal.idMeal}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#315c42]"
                  >
                    Дивитися на TheMealDB
                    <TransitionArrow external />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-white p-6 text-[#716b61]">
            Для вказаних продуктів зовнішніх рецептів не знайдено.
          </p>
        )}
      </div>
    </section>
  );
}
