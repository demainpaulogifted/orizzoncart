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
    is_digital: false,
    category: '' 
  });
  const [images, setImages] = useState<string[]>([]);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [digitalFileUrl, setDigitalFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
      const { data: merchants } = await supabase.from('merchants').select('id').eq('user_id', user.id);
      const merchant = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];
      
      if (merchant) {
        const { data: products } = await supabase
          .from('products')
          .select('category')
          .eq('merchant_id', merchant.id)
          .not('category', 'is', null);
        const cats = Array.from(new Set((products || []).map(p => p.category).filter(Boolean)));
        setExistingCategories(cats);
      }
    };
    loadCategories();
  }, []);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const urls: string[] = [];
    
    for (const file of Array.from(files)) {
      const path = `${user?.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
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

  const handleDigitalFileUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const path = `${user?.id}/digital/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('digital-products').upload(path, file, { upsert: false });
    
    if (error) {
      toast.error('File upload failed: ' + error.message);
      setUploading(false);
      return;
    }
    
    const { data } = supabase.storage.from('digital-products').getPublicUrl(path);
    setDigitalFileUrl(data.publicUrl);
    setDigitalFile(file);
    setUploading(false);
    toast.success('Digital file uploaded!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.is_digital && !digitalFileUrl) {
      toast.error('Please upload a digital file for delivery');
      return;
    }
    
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
    const { data: merchants } = await supabase.from('merchants').select('id').eq('user_id', user?.id);
    const merchant = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];

    if (!merchant) {
      toast.error('Store not found.');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('products').insert({
      merchant_id: merchant.id,
      name: form.name,
      slug: `${generateSlug(form.name)}-${Math.random().toString(36).substring(2, 6)}`,
      price: parseFloat(form.price),
      description: form.description,
      is_digital: form.is_digital,
      category: form.category || null,
      is_active: true,
      images: images.map((url) => ({ url })),
      digital_file_url: form.is_digital ? digitalFileUrl : null,
      digital_file_name: form.is_digital ? digitalFile?.name : null,
    });

    if (error) {
      toast.error('Failed: ' + error.message);
    } else {
      toast.success('Product published! 🚀');
      router.push('/dashboard/products');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <h1 className="text-xl font-bold">Add Product</h1>

        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
          <input type="checkbox" checked={form.is_digital} onChange={(e) => setForm({ ...form, is_digital: e.target.checked })} className="w-4 h-4 accent-purple-600" />
          This is a digital product (no shipping)
        </label>

        {/* Digital File Upload */}
        {form.is_digital && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Digital File (PDF, ZIP, etc.) *</label>
            {digitalFileUrl ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-green-900">{digitalFile?.name}</p>
                  <p className="text-xs text-green-700">File uploaded successfully</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setDigitalFileUrl(''); setDigitalFile(null); }}
                  className="text-red-600 text-xs font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-purple-400 ${uploading ? 'opacity-50' : 'bg-gray-50'}`}>
                <span className="text-3xl">📄</span>
                <span className="text-sm font-bold text-gray-700">{uploading ? 'Uploading...' : 'Click to upload digital file'}</span>
                <span className="text-xs text-gray-500">PDF, ZIP, DOC, etc.</span>
                <input
                  type="file"
                  accept=".pdf,.zip,.doc,.docx,.epub"
                  className="hidden"
                  onChange={(e) => handleDigitalFileUpload(e.target.files?.[0] || null)}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        )}

        {/* Image Upload (only for physical or digital preview) */}
        {!form.is_digital && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Photos *</label>
            
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

            <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-purple-400 ${uploading ? 'opacity-50' : 'bg-gray-50'}`}>
              <span className="text-3xl">📸</span>
              <span className="text-sm font-bold text-gray-700">{uploading ? 'Uploading...' : 'Tap to add photos'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} disabled={uploading} />
            </label>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
          <input 
            list="categories"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g., Summer Sale, VIP..."
            className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
          <datalist id="categories">
            {existingCategories.map(cat => <option key={cat} value={cat} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
          <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <button type="submit" disabled={saving || uploading} className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
          {saving ? 'Publishing...' : 'Publish Product 🚀'}
        </button>
      </form>

      <div>
        <p className="text-sm font-bold text-gray-500 mb-2">LIVE PREVIEW</p>
        <div className="bg-white rounded-2xl border p-4 sticky top-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-md">
            {images[0] ? (
              <Image src={images[0]} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                {form.is_digital ? '📄' : '📸'}
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            {form.category && <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full mb-2">{form.category}</span>}
            <h3 className="text-lg font-medium text-gray-900">{form.name || 'Product name'}</h3>
            <p className="mt-1 text-xl font-bold text-purple-600">₦{Number(form.price || 0).toLocaleString()}</p>
            {form.is_digital && <p className="text-xs text-blue-600 mt-1">⚡ Instant Digital Download</p>}
          </div>
        </div>
      </div>
    </div>
  );
}