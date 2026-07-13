"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import BrandMark from "@/components/brand-mark";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(data.get("email")),
      password: String(data.get("password")),
    });
    setLoading(false);
    if (error) setError("Неправильна електронна пошта або пароль");
    else {
      router.replace("/admin");
      router.refresh();
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#FAF8FC] px-5">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm font-bold text-[#756A8A]">
          ← На головну
        </Link>
        <form
          onSubmit={login}
          className="mt-5 rounded-3xl border border-[#E5DFE9] bg-[#FFFDFF] p-8 shadow-xl shadow-[#6C6570]/5"
        >
          <BrandMark className="h-12 w-12" />
          <h1 className="mt-6 font-serif text-4xl text-[#35313B]">
            Вхід до адмінки
          </h1>
          <p className="mt-2 text-sm text-[#77717D]">
            Увійдіть під обліковим записом адміністратора.
          </p>
          <label className="mt-7 block text-sm font-bold">
            Електронна пошта
            <input
              required
              type="email"
              name="email"
              className="mt-2 w-full rounded-xl border border-[#E5DFE9] px-4 py-3 font-normal outline-none focus:border-[#756A8A]"
            />
          </label>
          <label className="mt-5 block text-sm font-bold">
            Пароль
            <input
              required
              type="password"
              name="password"
              className="mt-2 w-full rounded-xl border border-[#E5DFE9] px-4 py-3 font-normal outline-none focus:border-[#756A8A]"
            />
          </label>
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[#756A8A] py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Входимо…" : "Увійти"}
          </button>
        </form>
      </div>
    </main>
  );
}
