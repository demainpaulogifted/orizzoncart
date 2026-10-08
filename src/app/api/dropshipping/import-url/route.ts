<div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-green-900">🔗 CJ API upgrading? No problem.</p>
          <p className="text-xs text-green-700 mt-0.5">
            Paste any CJ product link and import it instantly — works even while CJ's API is down.
          </p>
        </div>
        <button
          onClick={importByLink}
          disabled={importingUrl}
          className="px-4 py-2.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 shrink-0"
        >
          {importingUrl ? 'Importing...' : 'Import by Link'}
        </button>
      </div>