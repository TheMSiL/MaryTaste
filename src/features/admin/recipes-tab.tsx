import Link from "next/link";
import type { AdminRecipe } from "./types";

type RecipesTabProps = {
  recipes: AdminRecipe[];
  loading: boolean;
  message: string;
  onDelete: (id: string) => void;
};

export default function RecipesTab({ recipes, loading, message, onDelete }: RecipesTabProps) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B58FA3]">Колекція</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Усі рецепти</h1>
      <p className="mt-3 text-[#77717D]">Переглядайте, редагуйте та видаляйте опубліковані рецепти.</p>
      {message && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{message}</p>}
      <div className="mt-8 overflow-hidden rounded-3xl border border-[#E5DFE9] bg-[#FFFDFF]">
        {loading ? (
          <p className="p-8 text-[#77717D]">Завантажуємо…</p>
        ) : recipes.length ? (
          recipes.map((recipe) => (
            <div key={recipe.id} className="flex flex-col gap-4 border-b border-[#F0EAF2] p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="wrap-break-word font-serif text-lg">{recipe.title}</h2>
                  {recipe.is_favorite && <span className="rounded-full bg-[#B58FA3] px-2 py-1 text-[10px] font-bold text-white">Улюблене</span>}
                </div>
                <p className="mt-1 text-xs text-[#7E7782]">{recipe.category} · {recipe.cooking_time} хв</p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0">
                <Link href={`/admin/edit/${recipe.id}`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#756A8A]/30 px-3 py-2 text-center text-sm font-semibold text-[#756A8A] transition-colors duration-300 hover:bg-[#EEEAF4] sm:px-4">Редагувати</Link>
                <button onClick={() => onDelete(recipe.id)} className="min-h-10 rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors duration-300 hover:bg-red-50 sm:px-4">Видалити</button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-8 text-[#77717D]">Рецептів поки немає.</p>
        )}
      </div>
    </>
  );
}
