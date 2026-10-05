import Link from 'next/link';

export default function FreeMarketingPage() {
  const platforms = [
    { name: 'Google Merchant Center (GMC)', status: 'Not Connected', icon: '🔍' },
    { name: 'Meta Commerce Manager (MCMC)', status: 'Not Connected', icon: '📘' },
    { name: 'TikTok Business Catalog (TBCC)', status: 'Not Connected', icon: '🎵' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/dashboard/marketing" className="text-purple-600 text-sm hover:underline mb-4 inline-block">← Back to Marketing</Link>
      <h1 className="text-2xl font-bold mb-2">Free Marketing Catalogs</h1>
      <p className="text-gray-500 mb-8">Connect your platforms. OrizzonCart will automatically push your product images, titles, and links.</p>

      <div className="space-y-4">
        {platforms.map((p) => (
          <div key={p.name} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.status}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}