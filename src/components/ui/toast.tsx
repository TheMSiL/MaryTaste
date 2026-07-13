"use client";

import { useEffect } from "react";

export type ToastMessage = {
  id: number;
  text: string;
  tone?: "default" | "success" | "error";
  persistent?: boolean;
};

type ToastProps = {
  toast: ToastMessage | null;
  onDismiss: () => void;
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast || toast.persistent) return;
    const timer = window.setTimeout(onDismiss, 2400);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast]);

  if (!toast) return null;

  const tone =
    toast.tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : toast.tone === "success"
        ? "border-[#D3C9DB] bg-[#F3EFF6] text-[#655B78]"
        : "border-white/20 bg-[#756A8A] text-white";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 left-1/2 z-[100] flex min-h-12 w-[calc(100%_-_2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_16px_45px_rgba(53,49,59,.18)] sm:bottom-auto sm:left-auto sm:right-6 sm:top-6 sm:w-auto sm:min-w-72 sm:translate-x-0 ${tone}`}
    >
      {toast.persistent && (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      <span className="flex-1">{toast.text}</span>
      {!toast.persistent && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Закрити повідомлення"
          className="grid h-7 w-7 place-items-center rounded-full text-lg opacity-60 transition hover:bg-black/5 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
