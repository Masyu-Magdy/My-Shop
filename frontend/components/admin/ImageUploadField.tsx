"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadService } from "@/services/upload.service";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploadField({ value, onChange, label = "Product image" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");

    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      onChange(url);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1.5">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition min-h-[140px] ${
          dragOver ? "border-(--color-primary) bg-purple-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {uploading ? (
          <Loader2 size={22} className="animate-spin text-(--color-primary)" />
        ) : value ? (
          <div className="relative w-full h-32">
            <Image src={value} alt="Preview" fill className="object-contain rounded-lg" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud size={22} className="text-gray-400" />
            <p className="text-xs text-gray-500 text-center">
              Drag &amp; drop an image here, or click to browse
            </p>
          </>
        )}
      </div>
    </div>
  );
}
