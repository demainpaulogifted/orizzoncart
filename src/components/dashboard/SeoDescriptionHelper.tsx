'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { generateMerchantSeoDescription } from '@/lib/seo-descriptions';

type Props = {
  name: string;
  price: string | number;
  isDigital?: boolean;
  currentDescription?: string;
  onApply: (description: string) => void;
};

export function SeoDescriptionHelper({
  name,
  price,
  isDigital = false,
  currentDescription = '',
  onApply,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!name?.trim()) {
      toast.error('Enter a product name first');
      return;
    }

    setLoading(true);
    try {
      const text = generateMerchantSeoDescription({
        name,
        price,
        is_digital: isDigital,
        description: currentDescription,
      });

      if (!text) {
        toast.error('Could not generate description');
        return;
      }

      onApply(text);
      toast.success('SEO description ready — you can still edit it');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline disabled:opacity-50"
    >
      {loading ? 'Writing…' : '✨ Help me write SEO description'}
    </button>
  );
}