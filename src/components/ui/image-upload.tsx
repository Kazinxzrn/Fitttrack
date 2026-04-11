"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Para demo, vamos usar URL.createObjectURL
    // Em produção, você faria upload para Supabase Storage
    const url = URL.createObjectURL(file);
    onChange(url);
    setIsUploading(false);
  };

  return (
    <div className={cn("relative", className)}>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-zinc-700">
          <img src={value} alt="Exercise" className="w-full h-32 object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 rounded-xl border-2 border-dashed border-zinc-700 hover:border-zinc-600 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          <Upload className="w-6 h-6" />
          <span className="text-sm">{isUploading ? "Enviando..." : "Adicionar imagem"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}