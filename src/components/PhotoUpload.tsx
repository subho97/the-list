'use client';

import { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  onFileSelect: (file: File | null) => void;
  currentPreview?: string | null;
  required?: boolean;
}

export default function PhotoUpload({ onFileSelect, currentPreview, required = false }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPreview || null);

  const handleFile = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelect(file);
    } else {
      setPreview(null);
      onFileSelect(null);
    }
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700">
        Photo{required && <span className="text-rust"> *</span>}
      </label>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-xl border border-stone-200 shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-stone-200 text-stone-500 hover:text-rust transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-amber-primary/40 hover:bg-amber-glow/20 transition-all duration-150"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-3 text-olive-light">
              <Camera size={24} />
              <Upload size={24} />
            </div>
            <p className="text-sm text-olive">Take a photo or upload one</p>
            <p className="text-[12px] text-olive-light">JPEG, PNG, WebP up to 5MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
        className="hidden"
      />
    </div>
  );
}
