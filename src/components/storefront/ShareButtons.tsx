'use client';
import { toast } from 'sonner';

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const enc = encodeURIComponent(url);
  const text = encodeURIComponent(`Check out ${title} on OrizzonCart!`);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast.success('Store link copied!'); }
    catch { toast.error('Copy failed'); }
  };
  const native = async () => {
    try { if (navigator.share) await navigator.share({ title, url }); } catch {}
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-3 px-4">
      <span className="text-xs font-bold text-gray-500">Share store:</span>
      <button onClick={native} className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold">📤 Share</button>
      <button onClick={copy} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">🔗 Copy Link</button>
      <a href={`https://wa.me/?text=${text}%20${enc}`} target="_blank" rel="noopener" className="px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold">WhatsApp</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener" className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold">Facebook</a>
      <a href={`https://twitter.com/intent/tweet?url=${enc}&text=${text}`} target="_blank" rel="noopener" className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold">X</a>
    </div>
  );
}