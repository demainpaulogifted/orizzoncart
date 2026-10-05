import Link from 'next/link';

export default function AdsPage() {
  const adPlatforms = [
    { name: 'Google Ads', requires: 'Requires GMC Connection', icon: '🔍' },
    { name: 'Meta Ads', requires: 'Requires MCMC Connection', icon: '📘' },
    { name: 'TikTok Ads', requires: 'Requires TBCC Connection', icon: '🎵' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/dashboard/marketing" className="text-purple-600 text-sm hover:underline mb-4 inline-block">← Back to Marketing</Link>
      <h1 className="text-2xl font-bold mb-2">Paid Ads</h1>
      <p className="text-gray-500 mb-8">Run ads for all your products at once. No need to upload them one by one.</p>

      <div className="space-y-4">
        {adPlatforms.map((p) => (
          <div key={p.name} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.requires}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
              Create Campaign
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}