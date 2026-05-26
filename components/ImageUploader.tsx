"use client";

import { useState, useCallback, useRef, DragEvent } from "react";

interface Props {
  onFiles: (files: File[]) => void;
}

export function ImageUploader({ onFiles }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleChange = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (arr.length > 0) onFiles(arr);
    },
    [onFiles]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files: File[] = [];
      for (const item of Array.from(e.clipboardData.items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
        dragging
          ? "border-teal-400 bg-teal-400/10 scale-[1.02]"
          : "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleChange(e.target.files)}
      />

      <div className="flex flex-col items-center gap-3">
        <div
          className={`text-4xl transition-transform ${dragging ? "scale-110" : ""}`}
        >
          📷
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">
            Drop gambar di sini, atau{" "}
            <span className="text-teal-400 underline">browse files</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            PNG, JPG, WEBP, BMP — bisa multiple sekaligus
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Ctrl+V untuk paste dari clipboard
          </p>
        </div>
      </div>
    </div>
  );
}
