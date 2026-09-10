'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function MerchantSupportPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [merchantId, setMerchantId] = useState('');
  const [userId, setUserId] = useState('');
  const [myName, setMyName] = useState('Merchant');

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data: merchant } = await supabase.from('merchants').select('id, store_name').eq('user_id', user.id).single();
    if (!merchant) return;
    setMerchantId(merchant.id);
    setMyName(merchant.store_name);
    const { data } = await supabase.from('support_messages').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.from('support_messages').insert({
      merchant_id: merchantId,
      sender_type: 'merchant',
      sender_id: userId,
      sender_name: myName,
      message: text.trim(),
    });
    if (error) toast.error('Failed to send');
    else {
      setText('');
      load();
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Support Chat</h1>
        <p className="text-gray-600 text-sm">Message the OrizzonCart team. Replies show who answered you.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">No messages yet. Say hello! 👋</p>
          )}
          {messages.map((m) => {
            const mine = m.sender_type === 'merchant';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                  {!mine && (
                    <p className="text-[11px] font-bold text-purple-700 mb-0.5">
                      {m.sender_name} {m.sender_type === 'admin' ? '• Platform Admin' : '• Support Team'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
          <button type="submit" disabled={sending} className="px-5 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}