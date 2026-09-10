'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [form, setForm] = useState({ email: '', full_name: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('team_members').select('*').order('created_at', { ascending: false });
    setTeam(data || []);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // The person must have an account first
    const { data: profile } = await supabase.from('profiles').select('id, role').eq('email', form.email.toLowerCase()).maybeSingle();
    if (!profile) {
      toast.error('This person must create an OrizzonCart account first.');
      setSaving(false);
      return;
    }

    const { error: roleErr } = await supabase.from('profiles').update({ role: 'staff' }).eq('id', profile.id);
    const { error: teamErr } = await supabase.from('team_members').insert({
      admin_id: user?.id,
      email: form.email.toLowerCase(),
      full_name: form.full_name,
      role: 'staff',
    });

    if (roleErr || teamErr) toast.error('Failed to add team member');
    else {
      toast.success(`${form.full_name} added to the team! They can now reply to merchants.`);
      setForm({ email: '', full_name: '' });
      load();
    }
    setSaving(false);
  };

  const handleRemove = async (id: string, email: string) => {
    const supabase = createClient();
    await supabase.from('team_members').delete().eq('id', id);
    await supabase.from('profiles').update({ role: 'merchant' }).eq('email', email);
    toast.success('Team member removed');
    load();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Support Team</h1>
        <p className="text-gray-600 text-sm">Invite staff who can reply to merchant chats. Their name shows on every reply.</p>
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Chidera Okafor" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Their Email (must have an account)</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" placeholder="staff@example.com" />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Adding...' : 'Add Team Member'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border divide-y">
        {team.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">No team members yet.</p>}
        {team.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold text-gray-900">{t.full_name}</p>
              <p className="text-xs text-gray-500">{t.email}</p>
            </div>
            <button onClick={() => handleRemove(t.id, t.email)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}