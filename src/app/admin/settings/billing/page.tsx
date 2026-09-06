// ... (Keep the top part of your admin file the same) ...

      {/* 2. Recurring Maintenance Billing */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🔄</span> 
            Recurring Store Maintenance
          </h2>
          {/* The One-Click Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.is_recurring_billing_enabled} onChange={(e) => setSettings({ ...settings, is_recurring_billing_enabled: e.target.checked })} className="sr-only peer" />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* UPDATED DESCRIPTION TO REFLECT THE NEW RULE */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <strong>🔒 "Value-First" Rule Active:</strong> The recurring fee is strictly hidden from new merchants during onboarding. 
            It will only appear in their dashboard <em>after</em> they successfully pay the Activation Fee and their status becomes <code className="bg-blue-100 px-1 rounded">ACTIVE</code>.
          </p>
        </div>

        {settings.is_recurring_billing_enabled && (
           // ... (Keep the rest of your recurring fee inputs the same) ...
        )}
      </div>