import Link from "next/link";
import type { FormEvent } from "react";
import CustomSelect from "@/components/ui/custom-select";
import ImageFilePicker from "@/components/ui/image-file-picker";
import IngredientComposer from "@/features/ingredient-search/components/ingredient-composer";
import {
  categoryOptions,
  difficultyOptions,
} from "@/features/recipes/constants";

type NewRecipeTabProps = {
  file: File | null;
  ingredientsValue: string;
  message: string;
  saving: boolean;
  onFileChange: (file: File | null) => void;
  onIngredientsChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function NewRecipeTab({
  file,
  ingredientsValue,
  message,
  saving,
  onFileChange,
  onIngredientsChange,
  onSubmit,
}: NewRecipeTabProps) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B58FA3]">Новий запис</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Додати рецепт</h1>
      <p className="mt-3 text-sm leading-6 text-[#77717D] sm:text-base">
        Заповніть картку — рецепт з’явиться в загальній колекції.
      </p>
      <form
        onSubmit={onSubmit}
        className="admin-form mt-6 min-w-0 space-y-6 overflow-visible rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6 md:p-9"
      >
        <ImageFilePicker file={file} onChange={onFileChange} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Назва рецепта</span>
          <input required name="title" className="w-full rounded-xl border border-[#E5DFE9] px-4 py-3 outline-none focus:border-[#756A8A]" placeholder="Наприклад, вишневий пиріг" />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold">Час приготування, хв</span>
            <input required min="1" type="number" name="cooking_time" className="w-full rounded-xl border border-[#E5DFE9] px-4 py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Кількість порцій</span>
            <input required min="1" type="number" name="servings" defaultValue="4" className="w-full rounded-xl border border-[#E5DFE9] px-4 py-3" />
          </label>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <CustomSelect required name="category" label="Категорія" options={categoryOptions} placeholder="Виберіть категорію" />
          <CustomSelect name="difficulty" label="Складність" options={difficultyOptions} defaultValue="Легко" />
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#E7DFE8] bg-[#F6F0F5] p-4">
          <span className="min-w-0">
            <b className="block text-sm">Позначити як улюблене</b>
            <small className="mt-1 block text-[#7E7782]">На картці з’явиться плашка «Улюблене»</small>
          </span>
          <input type="checkbox" name="is_favorite" className="h-5 w-5 shrink-0 accent-[#B58FA3]" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Короткий опис</span>
          <textarea required name="description" rows={3} className="w-full resize-none rounded-xl border border-[#E5DFE9] px-4 py-3" placeholder="Кілька слів про страву..." />
        </label>
        <div>
          <span className="mb-2 block text-sm font-bold">
            Інгредієнти <small className="font-normal text-[#847D89]">— оберіть продукт і вкажіть кількість</small>
          </span>
          <input type="hidden" name="ingredients" value={ingredientsValue} />
          <div className="rounded-2xl border border-[#E5DFE9] bg-[#FCFAFD] p-3">
            <IngredientComposer recipeMode value={ingredientsValue} onChange={onIngredientsChange} />
          </div>
          {!ingredientsValue && <p className="mt-2 text-xs text-[#847D89]">Додайте щонайменше один інгредієнт.</p>}
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">
            Приготування <small className="font-normal text-[#847D89]">— кожен крок з нового рядка</small>
          </span>
          <textarea required name="instructions" rows={7} className="w-full resize-none rounded-xl border border-[#E5DFE9] px-4 py-3" placeholder="Підготуйте інгредієнти…" />
        </label>
        {message && (
          <p className={`rounded-xl p-4 text-sm ${message.startsWith("Помилка") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{message}</p>
        )}
        <div className="flex flex-col-reverse gap-3 border-t border-[#F0EAF2] pt-6 sm:flex-row sm:justify-end">
          <Link href="/" className="rounded-full px-5 py-3 text-center text-sm font-bold">Скасувати</Link>
          <button disabled={saving} className="rounded-full bg-[#756A8A] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Зберігаємо…" : "Опублікувати рецепт"}
          </button>
        </div>
      </form>
    </>
  );
}
