import Link from "next/link";
import MobileMenu from "@/app/components/mobile-menu";
import TransitionArrow from "@/components/ui/transition-arrow";
import BrandMark from "@/components/brand-mark";

export default function SiteHeader() {
  return (
    <header className="border-b border-[#E5DFE9] bg-[#FAF8FC]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-360 items-center justify-between px-4 py-4 sm:px-5 sm:py-5 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <BrandMark />
          <span>
            <b className="block font-serif text-xl leading-5">MaryTaste</b>
            <small className="text-[#7E7782]">Готуємо з любов’ю</small>
          </span>
        </Link>
        <Link
          href="/catalog"
          className="group hidden items-center duration-300 gap-2 rounded-full border border-[#756A8A] py-1.5 pl-4 pr-1.5 text-sm font-semibold text-[#756A8A] transition hover:bg-[#756A8A] hover:text-white sm:flex"
        >
          Рецепти
          <TransitionArrow />
        </Link>
        <MobileMenu />
      </div>
    </header>
  );
}
