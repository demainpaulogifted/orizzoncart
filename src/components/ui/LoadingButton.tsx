'use client';
import { useState } from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAsync?: () => Promise<void>;
  loadingText?: string;
}

export function LoadingButton({ children, onClickAsync, loadingText = '...', ...props }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClickAsync || loading) return;
    e.preventDefault();
    setLoading(true);
    try {
      await onClickAsync();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      {...props}
      onClick={onClickAsync ? handleClick : props.onClick}
      disabled={props.disabled || loading}
      className={props.className + (loading ? ' opacity-70 cursor-not-allowed' : '')}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {loadingText}
        </span>
      ) : children}
    </button>
  );
}