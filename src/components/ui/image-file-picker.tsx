"use client";

import { useId, useState } from "react";

type ImageFilePickerProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  hint?: string;
};

export default function ImageFilePicker({
  file,
  onChange,
  label = "Фотографія страви",
  hint = "JPEG, PNG або WebP",
}: ImageFilePickerProps) {
  const id = useId();
  const [dragging, setDragging] = useState(false);

  function acceptFile(nextFile?: File) {
    if (nextFile?.type.startsWith("image/")) onChange(nextFile);
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <label
        htmlFor={id}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          acceptFile(event.dataTransfer.files[0]);
        }}
        className={`group flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-6 text-center transition ${dragging ? "border-[#315c42] bg-[#e7f0e9]" : "border-[#d8d1c3] bg-[#faf8f3] hover:border-[#315c42]/60 hover:bg-[#f5f7f2]"}`}
      >
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => acceptFile(event.target.files?.[0])}
          className="sr-only"
        />
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e7f0e9] text-xl text-[#315c42] transition group-hover:scale-105">
          ↑
        </span>
        {file ? (
          <>
            <span className="mt-3 max-w-full truncate text-sm font-bold text-[#315c42]">
              {file.name}
            </span>
            <span className="mt-1 text-xs text-[#80796e]">
              Натисніть, щоб замінити фото
            </span>
          </>
        ) : (
          <>
            <span className="mt-3 text-sm font-bold text-[#315c42]">
              Обрати або перетягнути фото
            </span>
            <span className="mt-1 text-xs text-[#80796e]">{hint}</span>
          </>
        )}
      </label>
    </div>
  );
}
