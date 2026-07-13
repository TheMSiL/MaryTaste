"use client";

import { useState } from "react";
import type { AdminRecipe } from "./types";

type Props = { recipes: AdminRecipe[]; categories: string[]; onAdd: (name: string) => Promise<void>; onRename: (oldName: string, name: string) => Promise<void>; onRemove: (name: string) => Promise<void> };

export default function CategoriesTab({ recipes, categories, onAdd, onRename, onRemove }: Props) {
  const [name, setName] = useState("");
  return <>
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B58FA3]">Керування</p>
    <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Категорії</h1>
    <form className="mt-6 flex gap-2" onSubmit={async e => { e.preventDefault(); await onAdd(name); setName(""); }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Нова категорія" className="min-w-0 flex-1 rounded-xl border border-[#E5DFE9] bg-white px-4 py-3" />
      <button className="rounded-full bg-[#756A8A] px-5 py-3 font-bold text-white">Додати</button>
    </form>
    <div className="mt-6 grid gap-3">{categories.map(category => <div key={category} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] p-4">
      <div className="min-w-40 flex-1"><b className="font-serif text-lg">{category}</b><p className="text-xs text-[#7E7782]">{recipes.filter(r => r.category === category).length} рецептів</p></div>
      <button onClick={async () => { const next = window.prompt("Нова назва", category); if (next && next !== category) await onRename(category, next); }} className="rounded-full border px-4 py-2 text-sm">Перейменувати</button>
      <button onClick={() => void onRemove(category)} className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600">Видалити</button>
    </div>)}</div>
  </>;
}
