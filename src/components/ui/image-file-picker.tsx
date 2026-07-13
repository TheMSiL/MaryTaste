"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

type ImageFilePickerProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  hint?: string;
  currentUrl?: string | null;
};

export default function ImageFilePicker({
  file,
  onChange,
  label = "Фотографія страви",
  hint = "JPEG, PNG або WebP",
  currentUrl = null,
}: ImageFilePickerProps) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const preview = file ? filePreview : currentUrl;

  useEffect(() => {
    return () => { if (filePreview) URL.revokeObjectURL(filePreview); };
  }, [filePreview]);

  function acceptFile(nextFile?: File) {
    if (nextFile && ['image/jpeg', 'image/png', 'image/webp'].includes(nextFile.type) && nextFile.size <= 8 * 1024 * 1024) {
      setFilePreview(URL.createObjectURL(nextFile));
      onChange(nextFile);
    }
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
        className={`group relative flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-5 py-6 text-center transition ${dragging ? "border-[#756A8A] bg-[#EEEAF4]" : "border-[#E5DFE9] bg-[#FCFAFD] hover:border-[#756A8A]/60 hover:bg-[#F8F5FA]"}`}
      >
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => acceptFile(event.target.files?.[0])}
          className="sr-only"
        />
        {preview && <Image src={preview} alt="Предпросмотр фотографии" fill unoptimized className="object-cover" />}
        {preview && <span className="absolute inset-0 bg-black/35" />}
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#EEEAF4] text-xl text-[#756A8A] transition group-hover:scale-105">
          ↑
        </span>
        {file ? (
          <>
            <span className="relative mt-3 max-w-full truncate rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-[#756A8A]">
              {file.name}
            </span>
            <span className="relative mt-1 text-xs text-white">
              Натисніть, щоб замінити фото
            </span>
          </>
        ) : (
          <>
            <span className="relative mt-3 text-sm font-bold text-[#756A8A]">
              Обрати або перетягнути фото
            </span>
            <span className="relative mt-1 text-xs text-[#7E7782]">{hint} · до 8 МБ</span>
          </>
        )}
      </label>
    </div>
  );
}
