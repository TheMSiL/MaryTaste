"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const favoritesKey = "marytaste:favorite-recipes";
export const favoritesChangedEvent = "marytaste:favorites-changed";

export function readFavoriteIds() {
  try {
    const value = JSON.parse(localStorage.getItem(favoritesKey) || "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

export default function FavoritesLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readFavoriteIds().length);
    update();
    window.addEventListener("storage", update);
    window.addEventListener(favoritesChangedEvent, update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(favoritesChangedEvent, update);
    };
  }, []);

  return (
    <Link
      href="/favorites"
      aria-label={`Обрані рецепти: ${count}`}
      className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#D8D0DC] bg-[#FFFDFF] text-xl text-[#756A8A] transition hover:border-[#756A8A] hover:bg-[#F0EBF3]"
    >
      <span aria-hidden="true">♥</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#B58FA3] px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
