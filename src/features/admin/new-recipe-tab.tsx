import Link from "next/link";
import type { FormEvent, MouseEventHandler } from "react";
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
  categories: string[];
  saving: boolean;
  onFileChange: (file: File | null) => void;
  onIngredientsChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPreview: MouseEventHandler<HTMLButtonElement>;
  onCancel: MouseEventHandler<HTMLAnchorElement>;
  onDirty: () => void;
};

export default function NewRecipeTab({
  file,
  ingredientsValue,
  categories,
  saving,
  onFileChange,
  onIngredientsChange,
  onSubmit,
  onPreview,
  onCancel,
  onDirty,
}: NewRecipeTabProps) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B58FA3]">Новий запис</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Додати рецепт</h1>
      <p className="mt-3 text-sm leading-6 text-[#77717D] sm:text-base">
        Чернетку можна зберегти незаповненою. У колекції з’являються лише опубліковані рецепти.
      </p>
      <form
        onSubmit={onSubmit}
        onChange={onDirty}
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
          <CustomSelect required name="category" label="Категорія" options={(categories.length ? categories : categoryOptions.map(x => x.value)).map(value => ({ value, label: value }))} placeholder="Виберіть категорію" />
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
        <div className="flex flex-col-reverse gap-3 border-t border-[#F0EAF2] pt-6 sm:flex-row sm:justify-end">
          <Link href="/" onClick={onCancel} className="rounded-full px-5 py-3 text-center text-sm font-bold">Скасувати</Link>
          <button type="button" onClick={onPreview} className="rounded-full border border-[#756A8A]/30 px-5 py-3 text-sm font-bold text-[#756A8A]">Передперегляд</button>
          <button type="submit" name="status" value="draft" formNoValidate disabled={saving} className="rounded-full bg-[#EEEAF4] px-5 py-3 text-sm font-bold text-[#756A8A] disabled:opacity-60">Зберегти чернетку</button>
          <button type="submit" name="status" value="published" disabled={saving} className="rounded-full bg-[#756A8A] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Зберігаємо…" : "Опублікувати рецепт"}
          </button>
        </div>
      </form>
    </>
  );
}
