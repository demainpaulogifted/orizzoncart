'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ImageUploaderProps {
  images: { url: string }[];
  onChange: (images: { url: string }[]) => void;
  merchantId: string;
}

export function ProductImageUploader({ images, onChange, merchantId }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 1. Create instant local previews
    const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file));
    setLocalPreviews((prev) => [...prev, ...newPreviews]);

    // 2. Upload to Supabase
    uploadFiles(files);
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadFiles(files: FileList) {
    setUploading(true);
    const supabase = createClient();
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${merchantId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('products') // ️ Make sure your bucket is named 'products'
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('products').getPublicUrl(fileName);

      newImages.push({ url: publicUrl });
    }

    onChange(newImages);
    setUploading(false);
    setLocalPreviews([]); // Clear local previews once uploaded
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700">Product Images</label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button / Dropzone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <p className="text-purple-600 font-bold">Uploading...</p>
        ) : (
          <>
            <p className="text-2xl mb-1">📸</p>
            <p className="text-sm font-bold text-gray-700">Click to add photos</p>
            <p className="text-xs text-gray-500 mt-1">You can select multiple images at once</p>
          </>
        )}
      </button>

      {/* Previews Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Show local previews while uploading */}
        {localPreviews.map((src, i) => (
          <div key={`preview-${i}`} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border animate-pulse">
            <img src={src} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Show uploaded images */}
        {images.map((img, i) => (
          <div key={img.url} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border group">
            <img src={img.url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Cover
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}