"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TransitionArrow from "@/components/ui/transition-arrow";

const links = [
  { href: "/", label: "Головна" },
  { href: "/catalog", label: "Каталог рецептів" },
];

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenu(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative sm:hidden">
      <button
        type="button"
        aria-label={open ? "Закрити меню" : "Відкрити меню"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((current) => !current)}
        className="grid h-11 w-11 place-items-center rounded-full border border-[#756A8A]/35 bg-white/60 text-[#756A8A] transition active:scale-95"
      >
        <span className="relative block h-4 w-5" aria-hidden="true">
          <span
            className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`absolute left-0 top-[14px] h-0.5 w-5 rounded bg-current transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Мобільна навігація"
          className="absolute right-0 top-[calc(100%+12px)] z-50 w-60 overflow-hidden rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] p-2 shadow-[0_18px_50px_rgba(40,37,31,.18)]"
        >
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-semibold transition ${active ? "bg-[#EEEAF4] text-[#756A8A]" : "text-[#504A55] hover:bg-[#F3EFF6]"}`}
              >
                {link.label}
                {active ? (
                  <span aria-hidden="true">•</span>
                ) : (
                  <TransitionArrow />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
