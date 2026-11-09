'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    is_digital: false,
    category: '',
    is_active: true,
    // Flash Deal
    is_flash_deal: false,
    flash_deal_price: '',
    flash_deal_days: '7',
  });

  const [images, setImages] = useState<string[]>([]);
  const [digitalFileUrl, setDigitalFileUrl] = useState('');
  const [digitalFileName, setDigitalFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cookieId = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('active_merchant_id='))
        ?.split('=')[1];

      const { data: merchants } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id);

      const merchant =
        (merchants || []).find((m: any) => m.id === cookieId) ||
        (merchants || [])[0];

      if (!merchant) {
        toast.error('Store not found');
        router.push('/dashboard/products');
        return;
      }

      const { data: product, error } = await supabase.from('products')
        .select('*')
        .eq('id', productId)
        .eq('merchant_id', merchant.id)
        .single();

      if (error || !product) {
        toast.error('Product not found');
        router.push('/dashboard/products');
        return;
      }

      let days = '7';
      if (product.flash_deal_ends_at) {
        const end = new Date(product.flash_deal_ends_at).getTime();
        const now = Date.now();
        const remaining = Math.max(1, Math.ceil((end - now) / (24 * 60 * 60 * 1000)));
        if (remaining >= 30) days = '30';
        else if (remaining >= 14) days = '14';
        else days = '7';
      }

      setForm({
        name: product.name || '',
        price: String(product.price || ''),
        description: product.description || '',
        is_digital: !!product.is_digital,
        category: product.category || '',
        is_active: product.is_active !== false,
        is_flash_deal: !!product.is_flash_deal,
        flash_deal_price: product.flash_deal_price != null ? String(product.flash_deal_price) : '',
        flash_deal_days: days,
      });

      const loadedImages = (product.images || [])
        .map((i: any) => (typeof i === 'string' ? i : i.url))
        .filter(Boolean);
      setImages(loadedImages);

      setDigitalFileUrl(product.digital_file_url || '');
      setDigitalFileName(product.digital_file_name || '');

      const { data: products } = await supabase
        .from('products')
        .select('category')
        .eq('merchant_id', merchant.id)
        .not('category', 'is', null);

      const cats = Array.from(
        new Set((products || []).map((p) => p.category).filter(Boolean))
      );
      setExistingCategories(cats);

      setLoading(false);
    };

    load();
  }, [productId, router]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const path = `\( {user?.id}/ \){Date.now()}-${file.name.replace(/\s+/g, '-')}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false });

      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      } else {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    if (urls.length > 0) {
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} photo(s) uploaded!`);
    }
    setUploading(false);
  };

  const handleDigitalFileUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const path = `\( {user?.id}/digital/ \){Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { error } = await supabase.storage
      .from('digital-products')
      .upload(path, file, { upsert: false });

    if (error) {
      toast.error('File upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('digital-products').getPublicUrl(path);
    setDigitalFileUrl(data.publicUrl);
    setDigitalFileName(file.name);
    setUploading(false);
    toast.success('Digital file uploaded!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.is_digital && !digitalFileUrl) {
      toast.error('Please upload a digital file for delivery');
      return;
    }

    const price = parseFloat(form.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Please enter a valid product price.');
      return;
    }

    let flashDealPrice: number | null = null;
    let flashDealEndsAt: string | null = null;

    if (form.is_flash_deal) {
      flashDealPrice = Number(form.flash_deal_price);
      if (
        form.flash_deal_price.trim() === '' ||
        !Number.isFinite(flashDealPrice) ||
        flashDealPrice < 0
      ) {
        toast.error('Please enter a valid Flash Deal price.');
        return;
      }
      if (flashDealPrice >= price) {
        toast.error('Flash Deal price must be lower than the normal price.');
        return;
      }
      const days = parseInt(form.flash_deal_days, 10) || 7;
      const ends = new Date();
      ends.setDate(ends.getDate() + days);
      ends.setHours(23, 59, 59, 999);
      flashDealEndsAt = ends.toISOString();
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('products')
      .update({
        name: form.name,
        price,
        description: form.description,
        is_digital: form.is_digital,
        category: form.category || null,
        is_active: form.is_active,
        images: images.map((url) => ({ url })),
        digital_file_url: form.is_digital ? digitalFileUrl : null,
        digital_file_name: form.is_digital ? digitalFileName : null,
        is_flash_deal: form.is_flash_deal,
        flash_deal_price: form.is_flash_deal ? flashDealPrice : null,
        flash_deal_ends_at: form.is_flash_deal ? flashDealEndsAt : null,
      })
      .eq('id', productId);

    if (error) {
      toast.error('Failed: ' + error.message);
    } else {
      toast.success(
        form.is_flash_deal
          ? 'Product updated and Flash Deal saved!'
          : 'Product updated successfully!'
      );
      router.push('/dashboard/products');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Edit Product</h1>
          <Link
            href="/dashboard/products"
            className="text-sm font-bold text-gray-500 hover:text-gray-800"
          >
            ← Back
          </Link>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={form.is_digital}
            onChange={(e) => setForm({ ...form, is_digital: e.target.checked })}
            className="w-4 h-4 accent-purple-600"
          />
          This is a digital product (no shipping)
        </label>

        {form.is_digital && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Digital File *
            </label>
            {digitalFileUrl ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-green-900">
                    {digitalFileName || 'Digital file'}
                  </p>
                  <p className="text-xs text-green-700">File ready</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDigitalFileUrl('');
                    setDigitalFileName('');
                  }}
                  className="text-red-600 text-xs font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-purple-400 ${
                  uploading ? 'opacity-50' : 'bg-gray-50'
                }`}
              >
                <span className="text-3xl">📄</span>
                <span className="text-sm font-bold text-gray-700">
                  {uploading ? 'Uploading...' : 'Click to upload digital file'}
                </span>
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

        {!form.is_digital && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Photos
            </label>

            {images.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {images.map((url, i) => (
                  <div
                    key={url}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border shrink-0 bg-gray-100"
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, index) => index !== i))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm"
                    >
                      ✕
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-[8px] text-center py-0.5 font-bold">
                        MAIN
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <label
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-purple-400 ${
                uploading ? 'opacity-50' : 'bg-gray-50'
              }`}
            >
              <span className="text-3xl">📸</span>
              <span className="text-sm font-bold text-gray-700">
                {uploading ? 'Uploading...' : 'Tap to add photos'}
              </span>
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
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category (Optional)
          </label>
          <input
            list="categories"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g., Summer Sale, VIP..."
            className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
          <datalist id="categories">
            {existingCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Normal Price (₦) *
          </label>
          <input
            required
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Shown everywhere except Flash Deals.
          </p>
        </div>

        {/* Flash Deal */}
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 space-y-3">
          <label className="flex items-center gap-3 text-sm font-bold text-gray-900">
            <input
              type="checkbox"
              checked={form.is_flash_deal}
              onChange={(e) => setForm({ ...form, is_flash_deal: e.target.checked })}
              className="w-4 h-4 accent-orange-600"
            />
            ⚡ Add to Flash Deals
          </label>

          {form.is_flash_deal && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flash Deal Price (₦) *
                </label>
                <input
                  type="number"
                  value={form.flash_deal_price}
                  onChange={(e) => setForm({ ...form, flash_deal_price: e.target.value })}
                  placeholder="Must be lower than normal price"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Duration
                </label>
                <select
                  value={form.flash_deal_days}
                  onChange={(e) => setForm({ ...form, flash_deal_days: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 accent-purple-600"
          />
          Active (visible on storefront)
        </label>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
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
            {form.category && (
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full mb-2">
                {form.category}
              </span>
            )}
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
              {form.name || 'Product name'}
            </h3>
            <p className="mt-1 text-xl font-bold text-purple-600">
              ₦{Number(form.price || 0).toLocaleString()}
            </p>
            {form.is_flash_deal && form.flash_deal_price && (
              <p className="text-sm text-orange-600 mt-1 font-bold">
                Flash: ₦{Number(form.flash_deal_price || 0).toLocaleString()}
              </p>
            )}
            {form.is_digital && (
              <p className="text-xs text-blue-600 mt-1">⚡ Instant Digital Download</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
