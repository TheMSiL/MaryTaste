import { categories } from "@/features/recipes/constants";
import type { AdminRecipe } from "./types";

export default function CategoriesTab({ recipes }: { recipes: AdminRecipe[] }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B58FA3]">Огляд</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Категорії</h1>
      <p className="mt-3 text-[#77717D]">Кількість рецептів у кожному розділі.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category} className="rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] p-5">
            <p className="font-serif text-xl">{category}</p>
            <p className="mt-2 text-sm text-[#7E7782]">
              {recipes.filter((recipe) => recipe.category === category).length} рецептів
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
