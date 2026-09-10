'use client';
import { useEffect } from 'react';

function getSource(): string {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get('utm_source');
  if (utm) return utm.toLowerCase();
  const ref = document.referrer;
  if (!ref) return 'Direct';
  try {
    const host = new URL(ref).hostname.replace('www.', '');
    if (host.includes('wa.me') || host.includes('whatsapp')) return 'WhatsApp';
    if (host.includes('facebook')) return 'Facebook';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('google')) return 'Google';
    if (host.includes('tiktok')) return 'TikTok';
    return host;
  } catch {
    return 'Direct';
  }
}

export function VisitTracker({ merchantId }: { merchantId: string }) {
  useEffect(() => {
    if (/bot|crawl|spider|preview|lighthouse/i.test(navigator.userAgent)) return;
    if (document.cookie.includes('-auth-token')) return; // skip logged-in merchants/admins = genuine visitors only

    const KEY = 'orz_session';
    let sess: any = null;
    try { sess = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
    const fresh = sess && Date.now() - sess.start < 30 * 60 * 1000;
    const sessionId = fresh ? sess.id : Math.random().toString(36).slice(2) + Date.now().toString(36);
    const start = fresh ? sess.start : Date.now();
    localStorage.setItem(KEY, JSON.stringify({ id: sessionId, start }));

    const send = (type: string) => {
      fetch('/api/track/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          session_id: sessionId,
          path: window.location.pathname,
          source: getSource(),
          referrer: document.referrer || null,
          device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          duration: Math.round((Date.now() - start) / 1000),
          type,
        }),
        keepalive: true,
      }).catch(() => {});
    };

    send('pageview');
    const beat = setInterval(() => send('beat'), 30000);
    const onHide = () => { if (document.visibilityState === 'hidden') send('beat'); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', () => send('beat'));
    return () => { clearInterval(beat); document.removeEventListener('visibilitychange', onHide); };
  }, [merchantId]);

  return null;
}