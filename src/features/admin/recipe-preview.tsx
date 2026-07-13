"use client";

import Image from "next/image";

export type RecipePreviewData = {
  title: string;
  description: string;
  category: string;
  cookingTime: string;
  servings: string;
  difficulty: string;
  image: string | null;
  ingredients: string[];
  instructions: string[];
};

export function previewFromForm(form: HTMLFormElement, image: string | null): RecipePreviewData {
  const data = new FormData(form);
  return {
    title: String(data.get("title") || "Без назви"),
    description: String(data.get("description") || "Опис ще не додано"),
    category: String(data.get("category") || "Без категорії"),
    cookingTime: String(data.get("cooking_time") || "—"),
    servings: String(data.get("servings") || "—"),
    difficulty: String(data.get("difficulty") || "—"),
    image,
    ingredients: String(data.get("ingredients") || "").split("\n").filter(Boolean),
    instructions: String(data.get("instructions") || "").split("\n").filter(Boolean),
  };
}

export default function RecipePreview({ data, onClose }: { data: RecipePreviewData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#35313B]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Предпросмотр рецепта">
      <div className="mx-auto my-6 max-w-4xl overflow-hidden rounded-3xl bg-[#FAF8FC] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5DFE9] p-5">
          <b>Так рецепт виглядатиме після публікації</b>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#EEEAF4]">×</button>
        </div>
        <article className="p-5 sm:p-8">
          <div className="grid gap-7 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B58FA3]">{data.category}</p>
              <h2 className="mt-3 font-serif text-4xl">{data.title}</h2>
              <p className="mt-4 leading-7 text-[#77717D]">{data.description}</p>
              <p className="mt-5 text-sm">◷ {data.cookingTime} хв · ♙ {data.servings} · ◇ {data.difficulty}</p>
            </div>
            {data.image ? <Image src={data.image} alt="" width={800} height={600} unoptimized className="aspect-4/3 w-full rounded-2xl object-cover" /> : <div className="grid aspect-4/3 place-items-center rounded-2xl bg-[#EEEAF4] text-[#847D89]">Фото не додано</div>}
          </div>
          <div className="mt-8 grid gap-7 md:grid-cols-2">
            <section><h3 className="font-serif text-2xl">Інгредієнти</h3><ul className="mt-3 space-y-2">{data.ingredients.map((item, i) => <li key={`${item}-${i}`}>• {item}</li>)}</ul></section>
            <section><h3 className="font-serif text-2xl">Приготування</h3><ol className="mt-3 space-y-3">{data.instructions.map((item, i) => <li key={`${item}-${i}`}><b>{i + 1}.</b> {item}</li>)}</ol></section>
          </div>
        </article>
      </div>
    </div>
  );
}
