'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';
import Image from 'next/image';
import { SeoDescriptionHelper } from '@/components/dashboard/SeoDescriptionHelper';

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', price: '', description: '', is_digital: false });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const urls: string[] = [];
    
    for (const file of Array.from(files)) {
      const path = `\( {user?.id}/ \){Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
    if (urls.length > 0) toast.success(`${urls.length} photo(s) uploaded!`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Multi-store safe: pick active store from cookie, else first store
    const { data: merchants } = await supabase.from('merchants').select('id').eq('user_id', user?.id);
    const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
    const merchant = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];

    if (!merchant) {
      toast.error('Store not found. Please refresh and try again.');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('products').insert({
      merchant_id: merchant.id,
      name: form.name,
      slug: `\( {generateSlug(form.name)}- \){Math.random().toString(36).substring(2, 6)}`,
      price: parseFloat(form.price),
      description: form.description,
      is_digital: form.is_digital,
      is_active: true,
      images: images.map((url) => ({ url })),
    });

    if (error) {
      console.error('Insert error:', error);
      toast.error('Failed: ' + error.message);
    } else {
      toast.success('Product published! ');
      router.push('/dashboard/products');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <h1 className="text-xl font-bold">Add Product</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Photos *</label>
          
          {/* Existing Images Preview */}
          {images.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border shrink-0">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setImages(images.filter((_, x) => x !== i))} 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-purple-400 transition-colors ${uploading ? 'opacity-50' : 'bg-gray-50'}`}>
            <span className="text-3xl">📸</span>
            <span className="text-sm font-bold text-gray-700">{uploading ? 'Uploading...' : 'Tap to add photos'}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="Linen Summer Dress" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
          <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="25000" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <SeoDescriptionHelper
              name={form.name}
              price={form.price}
              isDigital={form.is_digital}
              currentDescription={form.description}
              onApply={(description) => setForm({ ...form, description })}
            />
          </div>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Fabric, size, color... or tap “Help me write SEO description”"
          />
          <p className="mt-1 text-xs text-gray-500">
            Tip: add real product details first, then use the helper to polish for Google.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
          <input type="checkbox" checked={form.is_digital} onChange={(e) => setForm({ ...form, is_digital: e.target.checked })} className="w-4 h-4 accent-purple-600" />
          This is a digital product (no shipping)
        </label>

        <button type="submit" disabled={saving || uploading || images.length === 0} className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
          {saving ? 'Publishing...' : images.length === 0 ? 'Add at least 1 photo to publish' : 'Publish Product 🚀'}
        </button>
      </form>

      <div>
        <p className="text-sm font-bold text-gray-500 mb-2">LIVE PREVIEW</p>
        <div className="bg-white rounded-2xl border p-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-md">
            {images[0] ? (
              <Image src={images[0]} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📸</div>
            )}
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">{form.name || 'Product name'}</h3>
            <p className="mt-1 text-xl font-bold text-purple-600">₦{Number(form.price || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}