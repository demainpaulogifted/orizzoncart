const GRADIENTS: Record<string, string> = {
  green: 'from-green-500 to-emerald-700',
  blue: 'from-blue-500 to-indigo-700',
  purple: 'from-purple-500 to-violet-700',
  pink: 'from-pink-500 to-rose-700',
  orange: 'from-orange-500 to-red-700',
  yellow: 'from-amber-400 to-orange-600',
  teal: 'from-teal-500 to-cyan-700',
  red: 'from-red-500 to-rose-700',
  indigo: 'from-indigo-500 to-purple-700',
  gray: 'from-slate-500 to-slate-700',
};

const SOLIDS: Record<string, string> = {
  green: 'bg-emerald-700', blue: 'bg-indigo-700', purple: 'bg-violet-700', pink: 'bg-rose-700',
  orange: 'bg-red-600', yellow: 'bg-orange-600', teal: 'bg-cyan-700', red: 'bg-rose-700',
  indigo: 'bg-purple-700', gray: 'bg-slate-700',
};

const TEXTS: Record<string, string> = {
  green: 'text-emerald-700', blue: 'text-indigo-700', purple: 'text-violet-700', pink: 'text-rose-700',
  orange: 'text-red-600', yellow: 'text-orange-600', teal: 'text-cyan-700', red: 'text-rose-700',
  indigo: 'text-purple-700', gray: 'text-slate-700',
};

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function flyerColorKey(title: string) {
  const keys = Object.keys(GRADIENTS);
  return keys[hash(title) % keys.length];
}

export function FlyerCover({
  title,
  category,
  colorKey,
  profit,
  className = '',
}: {
  title: string;
  category?: string;
  colorKey?: string;
  profit?: number;
  className?: string;
}) {
  const key = colorKey || flyerColorKey(title);
  const grad = GRADIENTS[key] || GRADIENTS.purple;
  const solid = SOLIDS[key] || SOLIDS.purple;
  const text = TEXTS[key] || TEXTS.purple;
  const variant = hash(title) % 6;

  const badge =
    profit !== undefined ? (
      <span className="absolute top-2 right-2 bg-white/95 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full z-10">
        🔥 {profit}%
      </span>
    ) : null;

  const cat = category ? (
    <span className="text-[8px] font-extrabold uppercase tracking-wider bg-black/25 text-white px-1.5 py-0.5 rounded self-start">
      {category}
    </span>
  ) : null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {variant === 0 && (
        <div className={`absolute inset-0 bg-gradient-to-br ${grad}`}>
          <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute inset-0 flex flex-col justify-between p-2.5">
            {cat}
            <div className="bg-white/95 rounded-md px-2 py-1.5 -rotate-2 shadow">
              <p className={`font-extrabold text-[12px] leading-tight uppercase ${text} line-clamp-2`}>{title}</p>
            </div>
          </div>
        </div>
      )}

      {variant === 1 && (
        <div className={`absolute inset-0 ${solid}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 2px, transparent 2px)', backgroundSize: '22px 22px' }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2.5 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-white/70 flex items-center justify-center mb-1.5">
              <span className="text-white font-extrabold text-[10px]">OC</span>
            </div>
            <p className="text-white font-extrabold text-[12px] leading-tight uppercase line-clamp-3">{title}</p>
          </div>
        </div>
      )}

      {variant === 2 && (
        <div className="absolute inset-0 bg-slate-100">
          <div className="absolute inset-x-0 top-0 h-1/2 flex items-center justify-center">
            <span className={`font-extrabold text-[9px] uppercase tracking-[0.25em] ${text}`}>OrizzonCart Digital</span>
          </div>
          <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-r ${grad} p-2 flex items-end`}>
            <p className="text-white font-extrabold text-[12px] leading-tight uppercase line-clamp-2">{title}</p>
          </div>
        </div>
      )}

      {variant === 3 && (
        <div className={`absolute inset-0 bg-gradient-to-tl ${grad}`}>
          <div className="absolute top-0 left-0 bg-white/95 px-2 py-1 rounded-br-lg">
            <span className={`font-extrabold text-[8px] uppercase tracking-wider ${text}`}>{category || 'Digital'}</span>
          </div>
          <div className="absolute inset-0 flex items-end p-2.5">
            <p className="text-white font-extrabold text-[13px] leading-tight uppercase line-clamp-3 drop-shadow">{title}</p>
          </div>
        </div>
      )}

      {variant === 4 && (
        <div className={`absolute inset-0 bg-gradient-to-br ${grad}`}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '14px 14px' }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
            <p className="text-white font-extrabold text-[13px] leading-tight uppercase line-clamp-2">{title}</p>
            <div className="w-8 h-1 bg-white/80 rounded-full mt-1.5" />
          </div>
        </div>
      )}

      {variant === 5 && (
        <div className="absolute inset-0 flex">
          <div className={`w-2/5 bg-gradient-to-b ${grad}`} />
          <div className="w-3/5 bg-white p-2 flex flex-col justify-center">
            <span className={`font-extrabold text-[8px] uppercase tracking-wider ${text}`}>{category || 'Digital'}</span>
            <p className={`font-extrabold text-[12px] leading-tight uppercase line-clamp-3 mt-1 ${text}`}>{title}</p>
          </div>
        </div>
      )}

      {badge}
    </div>
  );
}