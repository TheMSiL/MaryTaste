"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

type CustomSelectProps = {
  name: string;
  label?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  compact?: boolean;
};

export default function CustomSelect({
  name,
  label,
  options,
  value,
  defaultValue = "",
  placeholder = "Оберіть значення",
  required,
  onChange,
  compact = false,
}: CustomSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function choose(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <span
        id={`${id}-label`}
        className={compact ? "sr-only" : "mb-2 block text-sm font-bold"}
      >
        {label}
      </span>
      <input type="hidden" name={name} value={selectedValue} />
      <button
        type="button"
        aria-labelledby={`${id}-label`}
        aria-controls={`${id}-listbox`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between border bg-[#FFFDFF] text-left font-normal outline-none transition hover:border-[#AAA2AE] active:translate-y-px ${compact ? "min-h-9 rounded-lg px-2.5 text-sm" : "min-h-12 rounded-xl px-4"} ${open ? "border-[#756A8A] ring-4 ring-[#756A8A]/10" : "border-[#E5DFE9]"}`}
      >
        <span className={selected ? "text-[#35313B]" : "text-[#847D89]"}>
          {selected?.label || placeholder}
        </span>
        <span
          aria-hidden="true"
          className={`text-xs text-[#756A8A] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {required && !selectedValue && (
        <input
          required
          tabIndex={-1}
          aria-hidden="true"
          value=""
          onChange={() => undefined}
          className="pointer-events-none absolute bottom-0 left-1/2 h-px w-px opacity-0"
        />
      )}
      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-x-hidden overflow-y-auto rounded-2xl border border-[#E5DFE9] bg-[#FFFDFF] p-2 shadow-[0_18px_45px_rgba(40,37,31,.16)]"
        >
          {options.map((option) => {
            const active = option.value === selectedValue;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => choose(option.value)}
                className={`custom-select__option flex min-h-11 w-full items-center justify-between gap-2 whitespace-nowrap rounded-xl px-3 text-left text-sm transition ${active ? "bg-[#756A8A] font-semibold text-white" : "text-[#504A55] hover:bg-[#F3EFF6]"}`}
              >
                {option.label}
                {active && <span aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
