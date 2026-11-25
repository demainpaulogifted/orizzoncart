'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type PendingNavigation = {
  href: string;
  startedAt: number;
  pathname: string;
};

export function NavigationFeedback() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const pendingRef = useRef<PendingNavigation | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;

      // Ignore a rapid second tap on the same destination while its first
      // navigation is still in progress.
      if (pendingRef.current?.href === destination.href) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      pendingRef.current = {
        href: destination.href,
        startedAt: performance.now(),
        pathname: destination.pathname,
      };
      setElapsed(0);
      setPending(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Do not leave the UI locked if a route is interrupted or fails.
      timeoutRef.current = setTimeout(() => {
        pendingRef.current = null;
        setPending(false);
      }, 15000);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;

    if (!pendingRef.current || previousPath === pathname) return;

    const durationMs = Math.round(performance.now() - pendingRef.current.startedAt);
    console.info(`[navigation] ${pathname} committed in ${durationMs}ms`);
    pendingRef.current = null;
    setPending(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const interval = setInterval(() => {
      const startedAt = pendingRef.current?.startedAt;
      if (startedAt) setElapsed((performance.now() - startedAt) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, [pending]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (!pending) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl"
    >
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        Opening page… {elapsed.toFixed(1)}s
      </span>
    </div>
  );
}
