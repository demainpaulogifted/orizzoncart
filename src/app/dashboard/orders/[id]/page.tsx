'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*), merchants(store_name)')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    };
    load();
  }, [id]);