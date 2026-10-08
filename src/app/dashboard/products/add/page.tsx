'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';
import Image from 'next/image';

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    is_digital: false,
    stock: 0,
    track_inventory: true,
    allow_backorders: false,
  });
  
  // ✅ FIX 1: Use { url: string }[] to match database schema
  const [images, setImages] = useState<{ url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('products').select('category').not('category', 'is', null);
      if (data) {
        const cats = [...new Set(data.map((p: any) => p.category).filter(Boolean))];
        setExistingCategories(cats);
      }
    };
    fetchCategories();
  }, []);

  // ✅ FIX 2: Corrected string interpolation for fileName
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const uploadedUrls: { url: string }[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedUrls.push({ url: publicUrl });
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} uploaded`);
      }
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // ✅ FIX 3: Multi-store safe merchant lookup (uses active_merchant_id cookie)
      const activeMerchantId = document.cookie
        .split('; ')
        .find(row => row.startsWith('active_merchant_id='))
        ?.split('=')[1];

      const { data: merchants } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id);

      const list = merchants || [];
      const merchant = list.find((m: any) => m.id === activeMerchantId) || list[0];
      
      if (!merchant) throw new Error('No store found. Please create a store first.');

      const slug = generateSlug(form.name);

      const productData = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        category: form.category,
        images: images, // Now correctly { url: string }[]
        slug: slug,
        is_digital: form.is_digital,
        is_active: true,
        merchant_id: merchant.id,
        stock: form.track_inventory ? parseInt(form.stock.toString()) || 0 : 999999,
        track_inventory: form.track_inventory,
        allow_backorders: form.allow_backorders,
      };

      const { error } = await supabase.from('products').insert(productData);
      if (error) throw error;

      toast.success('Product created successfully!');
      router.push('/dashboard/products');
      router.refresh();
    } catch (error: any) {
      toast.error('Failed to create product: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========== PRODUCT IMAGES ========== */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images {images.length > 0 && `(${images.length})`}
          </label>

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {images.map((img, index) => (
                <div key={img.url} className="relative aspect-square rounded-xl overflow-hidden border bg-gray-100">
                  <Image src={img.url} alt={`Product ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center"
                  >
                    ×
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-purple-400 transition-colors">
            <span className="text-3xl">📷</span>
            <span className="text-sm font-bold text-gray-700 mt-2">
              {uploading ? 'Uploading...' : images.length === 0 ? 'Tap to add photos' : 'Add more photos'}
            </span>
            <span className="text-xs text-gray-500 mt-1">You can select multiple photos at once</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
          <input
            list="categories"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g., Men clothes, Summer Sale..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
          <datalist id="categories">
            {existingCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
          <input
            required
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Inventory */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory Management</h3>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="trackInventory"
              checked={form.track_inventory}
              onChange={(e) => setForm({ ...form, track_inventory: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <label htmlFor="trackInventory" className="font-medium text-gray-700">
              Track inventory for this product
            </label>
          </div>

          {form.track_inventory && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="How many units available?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.stock === 0 ? '⚠️ Product will show as Out of Stock' : `${form.stock} units available`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowBackorders"
                  checked={form.allow_backorders}
                  onChange={(e) => setForm({ ...form, allow_backorders: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <label htmlFor="allowBackorders" className="font-medium text-gray-700">
                  Allow customers to order when out of stock (backorders)
                </label>
              </div>
            </>
          )}
        </div>

        {/* Digital Product */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_digital"
            checked={form.is_digital}
            onChange={(e) => setForm({ ...form, is_digital: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded"
          />
          <label htmlFor="is_digital" className="font-medium text-gray-700">
            This is a digital product (download)
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Publishing...' : 'Publish Product 🚀'}
        </button>
      </form>
    </div>
  );
}