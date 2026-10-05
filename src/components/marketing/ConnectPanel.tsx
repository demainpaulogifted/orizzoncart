'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  platform: string;
  feedUrl: string;
  connected: boolean;
  steps: string[];
};

export function ConnectPanel({ platform, feedUrl, connected, steps }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(feedUrl);
    } catch {
      const input = document.createElement('input');
      input.value = feedUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function save(action: 'confirm' | 'disconnect') {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/marketing/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      setOpen(false);
      setConfirmed(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
      <div className="flex items-center gap-2">
        {connected ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Connected
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
            Not Connected
          </span>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
        >
          {open ? 'Close' : connected ? 'View Setup' : 'Connect'}
        </button>

        {connected && (
          <button
            onClick={() => save('disconnect')}
            disabled={saving}
            className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            Disconnect
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 w-full text-left bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">
              Your product feed link (the platform reads this automatically):
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={feedUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 text-xs px-2 py-2 border border-gray-300 rounded bg-white text-gray-600"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded hover:bg-gray-700 shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">
              Follow these steps once:
            </p>
            <ol className="list-decimal ml-4 text-xs text-gray-600 space-y-1">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          {!connected && (
            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5"
                />
                I have added this feed link to my account.
              </label>
              <button
                onClick={() => save('confirm')}
                disabled={!confirmed || saving}
                className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40"
              >
                {saving ? 'Saving...' : 'Mark as Connected'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}