
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';

type ProductImage = {
  url: string;
};

type Merchant = {
  id: string;
  merchant_type: string | null;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

function getFileExtension(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension && IMAGE_TYPES[extension]) {
    return extension;
  }

  const mimeExtension = Object.entries(IMAGE_TYPES).find(
    ([, mimeType]) => mimeType === file.type
  )?.[0];

  return mimeExtension === 'jpeg' ? 'jpg' : mimeExtension || null;
}

export default function AddProductPage() {
  const router = useRouter();

  // Keep one Supabase client for this mounted page.
  const [supabase] = useState(() => createClient());

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [merchantType, setMerchantType] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) return;

        const activeMerchantId = document.cookie
          .split('; ')
          .find((row) => row.startsWith('active_merchant_id='))
          ?.split('=')[1];

        const { data: merchants, error: merchantError } = await supabase
          .from('merchants')
          .select('id, merchant_type')
          .eq('user_id', user.id);

        if (merchantError) throw merchantError;

        const merchantList = (merchants || []) as Merchant[];
        const merchant =
          merchantList.find((item) => item.id === activeMerchantId) ||
          merchantList[0];

        if (!cancelled && merchant) {
          setMerchantType(merchant.merchant_type || 'physical');
        }

        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null);

        if (productsError) {
          console.error('Failed to load product categories:', productsError);
        }

        if (!cancelled && products) {
          const categories = [
            ...new Set(
              products
                .map((product: { category: string | null }) => product.category)
                .filter((category): category is string => Boolean(category))
            ),
          ];

          setExistingCategories(categories);
        }
      } catch (error) {
        console.error('Failed to load product form:', error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleImageUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('No photo was selected. Please try again.');
      return;
    }

    if (uploading) return;

    setUploading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Could not verify your login: ${authError.message}`);
      }

      if (!user) {
        throw new Error('Your session has expired. Sign in and try again.');
      }

      const uploadedImages: ProductImage[] = [];
      const failures: string[] = [];

      for (const file of Array.from(selectedFiles)) {
        if (file.size === 0) {
          failures.push(`${file.name}: The selected file is empty.`);
          continue;
        }

        if (file.size > MAX_IMAGE_SIZE) {
          failures.push(`${file.name}: The image must be 5 MB or smaller.`);
          continue;
        }

        const extension = getFileExtension(file);

        if (!extension) {
          failures.push(
            `${file.name}: Unsupported format. Choose JPG, PNG, WebP, GIF or AVIF.`
          );
          continue;
        }

        const contentType = IMAGE_TYPES[extension];

        // Use a user-specific folder, compatible with user-folder storage rules.
        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            contentType,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase image upload failed:', {
            file: file.name,
            message: uploadError.message,
            name: uploadError.name,
          });

          failures.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        const uploadedPath = uploadData?.path;

        if (!uploadedPath) {
          failures.push(
            `${file.name}: Supabase uploaded no file path. Please try again.`
          );
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadedPath);

        if (!publicUrlData?.publicUrl) {
          failures.push(`${file.name}: Could not create the image URL.`);
          continue;
        }

        uploadedImages.push({ url: publicUrlData.publicUrl });
      }

      if (uploadedImages.length > 0) {
        setImages((previous) => [...previous, ...uploadedImages]);

        toast.success(
          `${uploadedImages.length} photo${
            uploadedImages.length === 1 ? '' : 's'
          } uploaded successfully.`
        );
      }

      if (failures.length > 0) {
        console.error('Image upload failure details:', failures);

        // Show the actual reason, not a generic message that hides the error.
        toast.error(failures.slice(0, 2).join(' '), {
          duration: 8000,
        });

        if (failures.length > 2) {
          toast.error(`${failures.length - 2} more image(s) could not be uploaded.`);
        }
      }

      if (uploadedImages.length === 0 && failures.length === 0) {
        toast.error('No images were uploaded. Select a photo and try again.');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';

      console.error('Image upload error:', error);
      toast.error(`Image upload failed: ${message}`, {
        duration: 8000,
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((previous) => previous.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || uploading) return;

    const productName = form.name.trim();
    const price = Number(form.price);

    if (!productName) {
      toast.error('Please enter a product name.');
      return;
    }

    if (form.price.trim() === '' || !Number.isFinite(price) || price < 0) {
      toast.error('Please enter a valid product price.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error('You must be signed in to publish a product.');
      }

      const activeMerchantId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('active_merchant_id='))
        ?.split('=')[1];

      const { data: merchants, error: merchantError } = await supabase
        .from('merchants')
        .select('id, merchant_type')
        .eq('user_id', user.id);

      if (merchantError) throw merchantError;

      const merchantList = (merchants || []) as Merchant[];
      const merchant =
        merchantList.find((item) => item.id === activeMerchantId) ||
        merchantList[0];

      if (!merchant) {
        throw new Error('No store found. Please create a store first.');
      }

      const isDigital =
        merchant.merchant_type === 'digital' ? form.is_digital : false;

      const productData = {
        name: productName,
        price,
        description: form.description.trim(),
        category: form.category.trim() || null,
        images,
        slug: generateSlug(productName),
        is_digital: isDigital,
        is_active: true,
        merchant_id: merchant.id,
        stock: form.track_inventory
          ? Math.max(0, parseInt(form.stock.toString(), 10) || 0)
          : 999999,
        track_inventory: form.track_inventory,
        allow_backorders: form.allow_backorders,
      };

      const { error: insertError } = await supabase
        .from('products')
        .insert(productData);

      if (insertError) throw insertError;

      toast.success('Product created successfully!');
      router.push('/dashboard/products');
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';

      console.error('Product creation failed:', error);
      toast.error(`Failed to create product: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const showDigitalOption = merchantType === 'digital';

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Add New Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Product Images {images.length > 0 && `(${images.length})`}
          </label>

          {images.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img, index) => (
                <div
                  key={img.url}
                  className="relative aspect-square overflow-hidden rounded-xl border bg-gray-100"
                >
                  <img
                    src={img.url}
                    alt={`Product ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    onError={(event) => {
                      console.error(
                        'Product image failed to display. Check the URL and bucket access:',
                        img.url
                      );

                      event.currentTarget.style.display = 'none';

                      const fallback =
                        event.currentTarget.parentElement?.querySelector(
                          '[data-image-error]'
                        );

                      if (fallback instanceof HTMLElement) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />

                  <div
                    data-image-error
                    style={{ display: 'none' }}
                    className="absolute inset-0 items-center justify-center p-2 text-center text-xs text-red-600"
                  >
                    Image unavailable. Check Supabase Storage access.
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove product image ${index + 1}`}
                    className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    ×
                  </button>

                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 z-10 rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            id="product-image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const selectedFiles = event.currentTarget.files;

              if (selectedFiles && selectedFiles.length > 0) {
                void handleImageUpload(selectedFiles);
              } else {
                toast.error('No photo was selected. Please try again.');
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple-300 bg-gray-50 transition-colors hover:border-purple-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-3xl">📷</span>
            <span className="mt-2 text-sm font-bold text-gray-700">
              {uploading
                ? 'Uploading...'
                : images.length === 0
                  ? 'Tap to add photos'
                  : 'Add more photos'}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              Select one or more photos from your phone
            </span>
          </button>

          <p className="mt-2 text-xs text-gray-500">
            Supported formats: JPG, PNG, WebP, GIF and AVIF. Maximum 5 MB per
            image.
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category (Optional)
          </label>
          <input
            list="categories"
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value })
            }
            placeholder="e.g., Men clothes, Summer Sale..."
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <datalist id="categories">
            {existingCategories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        {/* Product Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Product Name *
          </label>
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Price (₦) *
          </label>
          <input
            required
            type="number"
            min="0"
            step="any"
            value={form.price}
            onChange={(event) =>
              setForm({ ...form, price: event.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Inventory */}
        <div className="border-t pt-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Inventory Management
          </h3>

          <div className="mb-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="trackInventory"
              checked={form.track_inventory}
              onChange={(event) =>
                setForm({
                  ...form,
                  track_inventory: event.target.checked,
                })
              }
              className="h-5 w-5 rounded text-purple-600"
            />
            <label
              htmlFor="trackInventory"
              className="font-medium text-gray-700"
            >
              Track inventory for this product
            </label>
          </div>

          {form.track_inventory && (
            <>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      stock: parseInt(event.target.value, 10) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="How many units available?"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowBackorders"
                  checked={form.allow_backorders}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      allow_backorders: event.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded text-purple-600"
                />
                <label
                  htmlFor="allowBackorders"
                  className="font-medium text-gray-700"
                >
                  Allow customers to order when out of stock (backorders)
                </label>
              </div>
            </>
          )}
        </div>

        {/* Digital Product */}
        {showDigitalOption && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_digital"
              checked={form.is_digital}
              onChange={(event) =>
                setForm({ ...form, is_digital: event.target.checked })
              }
              className="h-5 w-5 rounded text-purple-600"
            />
            <label htmlFor="is_digital" className="font-medium text-gray-700">
              This is a digital product (download)
            </label>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full rounded-xl bg-purple-600 py-3 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Publishing...' : 'Publish Product 🚀'}
        </button>
      </form>
    </div>
  );
}
