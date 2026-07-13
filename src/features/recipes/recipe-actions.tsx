"use client";

import { useEffect, useState } from "react";
import Toast, { type ToastMessage } from "@/components/ui/toast";
import {
  favoritesChangedEvent,
  favoritesKey,
  readFavoriteIds,
} from "@/components/favorites-link";

type RecipeActionsProps = {
  recipeId: string;
};

export default function RecipeActions({ recipeId }: RecipeActionsProps) {
  const [favorite, setFavorite] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    setFavorite(readFavoriteIds().includes(recipeId));
  }, [recipeId]);

  function toggleFavorite() {
    const favorites = new Set(readFavoriteIds());
    if (favorites.has(recipeId)) favorites.delete(recipeId);
    else favorites.add(recipeId);
    localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
    setFavorite(favorites.has(recipeId));
    window.dispatchEvent(new Event(favoritesChangedEvent));
  }

  async function shareRecipe() {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setToast({ id: Date.now(), text: "Посилання скопійовано", tone: "success" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setToast({ id: Date.now(), text: "Не вдалося поділитися", tone: "error" });
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ id: Date.now(), text: "Посилання скопійовано", tone: "success" });
    } catch {
      setToast({ id: Date.now(), text: "Не вдалося скопіювати посилання", tone: "error" });
    }
  }

  return (
    <div className="print-hidden mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={toggleFavorite}
        aria-pressed={favorite}
        className={`rounded-xl border px-4 py-3 text-sm font-bold transition active:translate-y-px ${favorite ? "border-[#756A8A] bg-[#756A8A] text-white" : "border-[#D8D0DC] bg-[#FFFDFF] text-[#756A8A] hover:bg-[#F0EBF3]"}`}
      >
        <span aria-hidden="true">{favorite ? "♥" : "♡"}</span>{" "}
        {favorite ? "В обраному" : "До обраного"}
      </button>
      <button
        type="button"
        onClick={() => void shareRecipe()}
        className="rounded-xl border border-[#D8D0DC] bg-[#FFFDFF] px-4 py-3 text-sm font-bold text-[#756A8A] transition hover:bg-[#F0EBF3] active:translate-y-px"
      >
        Поділитися
      </button>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="rounded-xl border border-[#D8D0DC] bg-[#FFFDFF] px-4 py-3 text-sm font-bold text-[#756A8A] transition hover:bg-[#F0EBF3] active:translate-y-px"
      >
        Копіювати посилання
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-xl border border-[#D8D0DC] bg-[#FFFDFF] px-4 py-3 text-sm font-bold text-[#756A8A] transition hover:bg-[#F0EBF3] active:translate-y-px"
      >
        <span aria-hidden="true">↧</span> Друкувати рецепт
      </button>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
