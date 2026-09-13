/**
 * Client-side product image compression.
 * Resizes large photos and encodes as JPEG to cut upload size.
 */

export type CompressOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0–1
  /** Skip if file is already under this size (bytes) */
  skipIfUnderBytes?: number;
};

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  skipIfUnderBytes: 280 * 1024, // \~280KB
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Compression failed'));
        else resolve(blob);
      },
      type,
      quality
    );
  });
}

/**
 * Compress a single image File for product upload.
 * Returns a new File (JPEG) or the original if compression isn't useful.
 */
export async function compressProductImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = { ...DEFAULTS, ...options };

  // Non-images or already small → leave alone
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  // HEIC/HEIF often fails in canvas — skip rather than break upload
  if (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$/i.test(file.name)
  ) {
    return file;
  }

  try {
    const img = await loadImage(file);
    const { naturalWidth: w, naturalHeight: h } = img;

    // Already small enough and within max dimensions
    if (
      file.size <= opts.skipIfUnderBytes &&
      w <= opts.maxWidth &&
      h <= opts.maxHeight
    ) {
      return file;
    }

    // Scale down to fit max box
    let targetW = w;
    let targetH = h;
    const ratio = Math.min(opts.maxWidth / w, opts.maxHeight / h, 1);
    targetW = Math.round(w * ratio);
    targetH = Math.round(h * ratio);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // White background (handles transparent PNGs → JPEG)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await canvasToBlob(canvas, 'image/jpeg', opts.quality);

    // If somehow larger, keep original
    if (blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'product';
    const safeName = `${baseName}.jpg`.replace(/\s+/g, '-');

    return new File([blob], safeName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    // Any failure → upload original so the merchant isn't blocked
    return file;
  }
}

/** Compress many files in sequence (safer on low-memory phones). */
export async function compressProductImages(
  files: File[],
  options?: CompressOptions
): Promise<File[]> {
  const out: File[] = [];
  for (const file of files) {
    out.push(await compressProductImage(file, options));
  }
  return out;
}

/** Human-readable size for UI/toasts */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}