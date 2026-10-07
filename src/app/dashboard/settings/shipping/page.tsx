'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
];

export default function ShippingSettingsPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  async function fetchZones() {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/shipping-zones');
      const data = await res.json();
      setZones(data.zones || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(zone?: any) {
    setEditing(
      zone || {
        zone_name: '',
        states: [],
        flat_fee: 0,
        free_shipping_threshold: null,
        is_default: false,
      }
    );
  }

  async function saveZone() {
    if (!editing.zone_name.trim()) {
      toast.error('Zone name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/shipping-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('✅ Shipping zone saved!');
      setEditing(null);
      fetchZones();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteZone(id: string) {
    if (!confirm('Delete this shipping zone?')) return;

    try {
      const res = await fetch(`/api/dashboard/shipping-zones?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Zone deleted');
      fetchZones();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-purple-600 text-sm hover:underline">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold mt-2">🚚 Shipping Zones</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set shipping costs by state/region. Customers will see the correct delivery fee at checkout.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          <button
            onClick={() => startEdit()}
            className="px-5 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
          >
            + Add Shipping Zone
          </button>

          {zones.length === 0 ? (
            <div className="bg-white border rounded-xl p-10 text-center">
              <p className="text-gray-500">No shipping zones configured yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Add your first zone to start charging for delivery
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="bg-white border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">
                        {zone.zone_name}
                        {zone.is_default && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                            DEFAULT
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {zone.states.length > 0 ? zone.states.join(', ') : 'All other states'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-purple-700">₦{Number(zone.flat_fee).toLocaleString()}</p>
                      {zone.free_shipping_threshold && (
                        <p className="text-[10px] text-green-600 font-bold">
                          Free over ₦{Number(zone.free_shipping_threshold).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      onClick={() => startEdit(zone)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteZone(zone.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">{editing.id ? 'Edit Zone' : 'Add Zone'}</h2>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Zone Name</label>
              <input
                value={editing.zone_name}
                onChange={(e) => setEditing({ ...editing, zone_name: e.target.value })}
                placeholder="e.g., Lagos, Abuja, Nationwide"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">States Covered</label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {NIGERIAN_STATES.map((state) => (
                  <label key={state} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editing.states.includes(state)}
                      onChange={(e) => {
                        const newStates = e.target.checked
                          ? [...editing.states, state]
                          : editing.states.filter((s: string) => s !== state);
                        setEditing({ ...editing, states: newStates });
                      }}
                    />
                    {state}
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Leave empty to apply to all other states not covered by other zones
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Shipping Fee (₦)</label>
              <input
                type="number"
                value={editing.flat_fee}
                onChange={(e) => setEditing({ ...editing, flat_fee: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                Free Shipping Threshold (₦) - Optional
              </label>
              <input
                type="number"
                value={editing.free_shipping_threshold || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    free_shipping_threshold: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="e.g., 50000 for free shipping over ₦50k"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.is_default}
                onChange={(e) => setEditing({ ...editing, is_default: e.target.checked })}
              />
              Make this the default zone (fallback for unmatched states)
            </label>

            <div className="flex gap-2 pt-4">
              <button
                onClick={saveZone}
                disabled={saving}
                className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Zone'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}