'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminSupportInbox() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [me, setMe] = useState<any>(null);

  const loadMe = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role, full_name, email').eq('id', user?.id).maybeSingle();
    setMe({ id: user?.id, role: profile?.role, name: profile?.full_name || profile?.email || 'Admin' });
    return { userId: user?.id, profile };
  };

  const loadConversations = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('support_messages').select('merchant_id, merchants(store_name)').order('created_at', { ascending: false });
    const map = new Map();
    (data || []).forEach((m: any) => {
      if (!map.has(m.merchant_id)) map.set(m.merchant_id, m.merchants?.store_name || 'Store');
    });
    setConversations(Array.from(map.entries()).map(([id, name]) => ({ id, name })));
  };

  const loadThread = async (merchantId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from('support_messages').select('*').eq('merchant_id', merchantId).order('created_at', { ascending: true });
    setMessages(data || []);
  };

  useEffect(() => {
    loadMe();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selected) {
      loadThread(selected);
      const i = setInterval(() => loadThread(selected), 15000);
      return () => clearInterval(i);
    }
  }, [selected]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selected || !me) return;
    const supabase = createClient();
    const { error } = await supabase.from('support_messages').insert({
      merchant_id: selected,
      sender_type: me.role === 'platform_admin' ? 'admin' : 'team',
      sender_id: me.id,
      sender_name: me.name,
      message: text.trim(),
    });
    if (error) toast.error('Failed to reply');
    else {
      setText('');
      loadThread(selected);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Support Inbox</h1>
        <p className="text-gray-600 text-sm">Merchant conversations. Your name appears on every reply.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border divide-y max-h-[70vh] overflow-y-auto">
          {conversations.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">No conversations yet.</p>}
          {conversations.map((c) => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full text-left p-4 hover:bg-gray-50 ${selected === c.id ? 'bg-purple-50' : ''}`}>
              <p className="font-bold text-gray-900 text-sm">{c.name}</p>
              <p className="text-xs text-gray-500">Tap to open conversation</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border flex flex-col h-[60vh] lg:h-[70vh]">
          {!selected ? (
            <p className="m-auto text-gray-400 text-sm">Select a conversation 👈</p>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const fromMerchant = m.sender_type === 'merchant';
                  return (
                    <div key={m.id} className={`flex ${fromMerchant ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${fromMerchant ? 'bg-gray-100 text-gray-900 rounded-bl-sm' : 'bg-purple-600 text-white rounded-br-sm'}`}>
                        <p className={`text-[11px] font-bold mb-0.5 ${fromMerchant ? 'text-gray-500' : 'text-purple-200'}`}>
                          {m.sender_name} {fromMerchant ? '• Merchant' : m.sender_type === 'admin' ? '• Platform Admin' : '• Support Team'}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleReply} className="border-t p-3 flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Reply as ${me?.name || '...'}...`} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                <button type="submit" className="px-5 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700">Reply</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}